import { db } from "../firebaseConfig";
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  collection, 
  query, 
  where,
  addDoc
} from "firebase/firestore";

// Helper: add in-app notifications
export const addNotification = async (customerUid, title, body) => {
  const notif = {
    id: "notif-" + Math.floor(Math.random() * 100000),
    customerUid,
    title,
    body,
    timestamp: new Date().toISOString(),
    read: false
  };
  await addDoc(collection(db, "notifications"), notif);
};

export const createBooking = async (bookingData) => {
  const cleanBooking = {
    ...bookingData,
    id: bookingData.id || "booking-" + Math.floor(Math.random() * 900000 + 100000),
    status: bookingData.status || "Pending",
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
    extraCharges: 0,
    penalty: 0,
    extraHours: 0,
    extraKm: 0,
    lateCharges: 0,
    penaltyAmount: 0,
    additionalCharges: 0,
    remarks: bookingData.remarks || ""
  };

  await setDoc(doc(db, "bookings", cleanBooking.id), cleanBooking);
  
  // Write payment record if paymentId exists
  if (cleanBooking.paymentId) {
    await setDoc(doc(db, "payments", cleanBooking.paymentId), {
      paymentId: cleanBooking.paymentId,
      bookingId: cleanBooking.id,
      customerUid: cleanBooking.customerUid,
      amount: cleanBooking.totalAmount,
      status: cleanBooking.paymentStatus || "Paid",
      timestamp: new Date().toISOString()
    });
  }

  // Trigger Notification
  await addNotification(
    cleanBooking.customerUid,
    "Booking Submitted",
    `Your booking request for ${cleanBooking.carName} has been received successfully.`
  );

  return cleanBooking;
};

export const getBookings = async () => {
  const querySnapshot = await getDocs(collection(db, "bookings"));
  const list = [];
  querySnapshot.forEach(docSnap => {
    list.push({ id: docSnap.id, ...docSnap.data() });
  });
  return list;
};

export const getBookingsForUser = async (userUid) => {
  const q = query(collection(db, "bookings"), where("customerUid", "==", userUid));
  const querySnapshot = await getDocs(q);
  const list = [];
  querySnapshot.forEach(docSnap => {
    list.push({ id: docSnap.id, ...docSnap.data() });
  });
  return list;
};

export const updateBookingStatus = async (bookingId, status, extraFields = {}) => {
  const updatedDate = new Date().toISOString();
  const bookingDoc = doc(db, "bookings", bookingId);
  
  await updateDoc(bookingDoc, {
    status,
    updatedDate,
    ...extraFields
  });
  
  const snap = await getDoc(bookingDoc);
  if (snap.exists()) {
    const data = snap.data();
    let notifTitle = `Booking ${status}`;
    let notifBody = `Your booking for ${data.carName} is now ${status}.`;
    if (status === "Over Time") {
      notifTitle = "Over Time Charges Added";
      notifBody = `Over Time charges/penalties have been updated for your booking of ${data.carName}. Please check your dashboard.`;
    }
    await addNotification(data.customerUid, notifTitle, notifBody);
  }
};
