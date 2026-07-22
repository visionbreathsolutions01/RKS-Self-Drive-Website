// src/services/availability.js
// Centralized vehicle availability logic for RKS Self Drive
import { db } from "../firebaseConfig";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  addDoc,
  Timestamp,
} from "firebase/firestore";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Convert "YYYY-MM-DD" + "HH:MM" to a JS Date */
export const toDatetime = (dateStr, timeStr = "00:00") => {
  return new Date(`${dateStr}T${timeStr}:00`);
};

/** Return the return datetime given pickup date, time, and number of days */
export const calcReturnDatetime = (pickupDate, pickupTime, numDays) => {
  const start = toDatetime(pickupDate, pickupTime);
  return new Date(start.getTime() + numDays * 24 * 60 * 60 * 1000);
};

/** Format a Date to "YYYY-MM-DD" string */
export const toDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * Return true if range [startA, endA) overlaps with [startB, endB).
 * All four are JS Date objects.
 */
export const rangesOverlap = (startA, endA, startB, endB) => {
  return startA < endB && endA > startB;
};

// ─────────────────────────────────────────────
// FIRESTORE: BLOCKED PERIODS CRUD
// ─────────────────────────────────────────────

const BLOCKED_COLLECTION = "blockedPeriods";

/** Fetch all blocked periods for a specific car */
export const getBlockedPeriodsForCar = async (carId) => {
  try {
    const q = query(
      collection(db, BLOCKED_COLLECTION),
      where("carId", "==", carId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn("getBlockedPeriodsForCar failed:", err);
    // fallback to localStorage
    const local = JSON.parse(localStorage.getItem("rks_blocked_periods") || "[]");
    return local.filter((p) => p.carId === carId);
  }
};

/** Fetch ALL blocked periods (admin overview) */
export const getAllBlockedPeriods = async () => {
  try {
    const snap = await getDocs(collection(db, BLOCKED_COLLECTION));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn("getAllBlockedPeriods failed:", err);
    return JSON.parse(localStorage.getItem("rks_blocked_periods") || "[]");
  }
};

/**
 * Admin: create a blocked period for a car.
 * @param {Object} data - { carId, carName, startDate "YYYY-MM-DD", endDate "YYYY-MM-DD", reason, notes, createdBy }
 */
export const createBlockedPeriod = async (data) => {
  const record = {
    ...data,
    createdAt: new Date().toISOString(),
  };

  // localStorage fallback
  const local = JSON.parse(localStorage.getItem("rks_blocked_periods") || "[]");
  const id = "block-" + Math.floor(Math.random() * 900000 + 100000);
  const withId = { id, ...record };
  local.push(withId);
  localStorage.setItem("rks_blocked_periods", JSON.stringify(local));

  try {
    await setDoc(doc(db, BLOCKED_COLLECTION, id), withId);
  } catch (err) {
    console.warn("createBlockedPeriod Firestore sync failed:", err);
  }
  return withId;
};

/** Admin: delete a blocked period */
export const deleteBlockedPeriod = async (blockId) => {
  const local = JSON.parse(localStorage.getItem("rks_blocked_periods") || "[]");
  const updated = local.filter((p) => p.id !== blockId);
  localStorage.setItem("rks_blocked_periods", JSON.stringify(updated));

  try {
    await deleteDoc(doc(db, BLOCKED_COLLECTION, blockId));
  } catch (err) {
    console.warn("deleteBlockedPeriod Firestore sync failed:", err);
  }
};

// ─────────────────────────────────────────────
// FIRESTORE: BOOKINGS FOR A CAR
// ─────────────────────────────────────────────

/** Fetch all ACTIVE bookings for a specific car (Pending / Confirmed / Active) */
export const getActiveBookingsForCar = async (carId) => {
  const ACTIVE_STATUSES = ["Pending", "Confirmed", "Active"];
  try {
    const q = query(
      collection(db, "bookings"),
      where("carId", "==", carId)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((b) => ACTIVE_STATUSES.includes(b.status));
  } catch (err) {
    console.warn("getActiveBookingsForCar failed:", err);
    const local = JSON.parse(localStorage.getItem("rks_bookings") || "[]");
    return local.filter(
      (b) => b.carId === carId && ACTIVE_STATUSES.includes(b.status)
    );
  }
};

/** Fetch ALL bookings for a car (for admin calendar display) */
export const getAllBookingsForCar = async (carId) => {
  try {
    const q = query(collection(db, "bookings"), where("carId", "==", carId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn("getAllBookingsForCar failed:", err);
    const local = JSON.parse(localStorage.getItem("rks_bookings") || "[]");
    return local.filter((b) => b.carId === carId);
  }
};

// ─────────────────────────────────────────────
// AVAILABILITY CHECK
// ─────────────────────────────────────────────

/**
 * Check if a car is available for the given rental window.
 * Returns { available: bool, conflictType: "booking"|"blocked"|null, conflictDetail: object|null }
 */
export const checkCarAvailability = async (
  carId,
  pickupDate,
  pickupTime,
  numDays
) => {
  const reqStart = toDatetime(pickupDate, pickupTime);
  const reqEnd = calcReturnDatetime(pickupDate, pickupTime, numDays);

  // 1. Check active bookings
  const bookings = await getActiveBookingsForCar(carId);
  for (const b of bookings) {
    const bStart = toDatetime(b.departureDate, b.departureTime || "00:00");
    const bEnd = calcReturnDatetime(
      b.departureDate,
      b.departureTime || "00:00",
      Number(b.days)
    );
    if (rangesOverlap(reqStart, reqEnd, bStart, bEnd)) {
      return {
        available: false,
        conflictType: "booking",
        conflictDetail: b,
      };
    }
  }

  // 2. Check admin-blocked periods
  const blocks = await getBlockedPeriodsForCar(carId);
  for (const block of blocks) {
    const bStart = toDatetime(block.startDate, "00:00");
    const bEnd = toDatetime(block.endDate, "23:59");
    if (rangesOverlap(reqStart, reqEnd, bStart, bEnd)) {
      return {
        available: false,
        conflictType: "blocked",
        conflictDetail: block,
      };
    }
  }

  return { available: true, conflictType: null, conflictDetail: null };
};

// ─────────────────────────────────────────────
// CALENDAR DATE STATUS (for 30-day view)
// ─────────────────────────────────────────────

export const STATUS_COLORS = {
  Available: "bg-green-100 border-green-400 text-green-800",
  Pending: "bg-yellow-100 border-yellow-400 text-yellow-800",
  Confirmed: "bg-blue-100 border-blue-400 text-blue-800",
  Active: "bg-purple-100 border-purple-400 text-purple-800",
  Completed: "bg-gray-100 border-gray-300 text-gray-500",
  Maintenance: "bg-orange-100 border-orange-400 text-orange-800",
  Blocked: "bg-red-100 border-red-400 text-red-800",
};

/**
 * Build a map of { "YYYY-MM-DD": statusLabel } for the next N days for a car.
 * Used by both Booking page calendar and Admin availability calendar.
 */
export const buildDateStatusMap = async (carId, numDays = 30) => {
  const bookings = await getAllBookingsForCar(carId);
  const blocks = await getBlockedPeriodsForCar(carId);

  const map = {};
  const today = new Date();

  for (let i = 0; i < numDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = toDateStr(d);
    map[dateStr] = "Available";
  }

  // Apply bookings
  for (const b of bookings) {
    if (!b.departureDate) continue;
    const bStart = toDatetime(b.departureDate, b.departureTime || "00:00");
    const bEnd = calcReturnDatetime(
      b.departureDate,
      b.departureTime || "00:00",
      Number(b.days)
    );
    for (let i = 0; i < numDays; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const dEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
      if (rangesOverlap(bStart, bEnd, dStart, dEnd)) {
        const dateStr = toDateStr(d);
        const priority = { Completed: 0, Pending: 1, Confirmed: 2, Active: 3 };
        const existing = map[dateStr];
        if (existing === "Available" || (priority[b.status] ?? -1) > (priority[existing] ?? -1)) {
          map[dateStr] = b.status || "Pending";
        }
      }
    }
  }

  // Apply blocked periods (highest priority — overrides booking statuses)
  for (const block of blocks) {
    const bStart = toDatetime(block.startDate, "00:00");
    const bEnd = toDatetime(block.endDate, "23:59");
    for (let i = 0; i < numDays; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const dEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
      if (rangesOverlap(bStart, bEnd, dStart, dEnd)) {
        map[toDateStr(d)] = "Blocked";
      }
    }
  }

  return map;
};

// ─────────────────────────────────────────────
// ADMIN: NEXT AVAILABLE DATE FOR A CAR
// ─────────────────────────────────────────────

export const getNextAvailableDate = async (carId) => {
  const statusMap = await buildDateStatusMap(carId, 60);
  const entries = Object.entries(statusMap).sort(([a], [b]) => (a < b ? -1 : 1));
  for (const [date, status] of entries) {
    if (status === "Available") return date;
  }
  return null; // blocked for 60+ days
};

// ─────────────────────────────────────────────
// ADMIN: CURRENT STATUS + CUSTOMER FOR A CAR
// ─────────────────────────────────────────────

export const getCarCurrentStatus = async (carId) => {
  const today = new Date();
  const todayStr = toDateStr(today);

  const bookings = await getAllBookingsForCar(carId);
  const blocks = await getBlockedPeriodsForCar(carId);

  // Check if currently blocked
  for (const block of blocks) {
    const bStart = toDatetime(block.startDate, "00:00");
    const bEnd = toDatetime(block.endDate, "23:59");
    if (today >= bStart && today <= bEnd) {
      return {
        status: "Blocked",
        reason: block.reason || "Maintenance",
        blockId: block.id,
        endDate: block.endDate,
      };
    }
  }

  // Check if currently under an active booking
  for (const b of bookings) {
    if (!b.departureDate) continue;
    const bStart = toDatetime(b.departureDate, b.departureTime || "00:00");
    const bEnd = calcReturnDatetime(
      b.departureDate,
      b.departureTime || "00:00",
      Number(b.days)
    );
    if (today >= bStart && today <= bEnd && ["Active", "Confirmed", "Pending"].includes(b.status)) {
      return {
        status: b.status,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        bookingId: b.id,
        returnDate: toDateStr(bEnd),
      };
    }
  }

  return { status: "Available" };
};
