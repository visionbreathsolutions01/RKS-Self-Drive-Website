// src/services/db.js
import { auth, db } from "../firebaseConfig";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  addDoc
} from "firebase/firestore";

// Pre-seeded Car Fleet
const DEFAULT_CARS = [
  {
    id: "ertiga",
    name: "Ertiga VXI (O)",
    price: 3000,
    fuel: "Petrol",
    transmission: "Manual",
    seats: 7,
    limit: "300 KM Limit",
    specs: ["24 Hours Rental", "300 KM Limit", "Extra KM Charges Applicable", "7 Seater", "Smart Infotainment"],
    desc: "Premium 7-seater perfect for family trips. Well maintained, spacious luggage compartment, and excellent mileage.",
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"
    ],
    available: true
  },
  {
    id: "brezza2025",
    name: "Brezza 2025",
    price: 2500,
    fuel: "Petrol",
    transmission: "Manual",
    seats: 5,
    limit: "300 KM Limit",
    specs: ["Top End Model", "Sunroof", "300 KM Limit", "Brand New", "Spacious Cabin"],
    desc: "Top-end compact SUV with dynamic sunroof and futuristic cabin. Built for premium comfort and style.",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
    ],
    available: true
  },
  {
    id: "baleno2025",
    name: "Baleno 2025",
    price: 2200,
    fuel: "Petrol",
    transmission: "Manual",
    seats: 5,
    limit: "300 KM Limit",
    specs: ["Brand New", "300 KM Limit", "Excellent Mileage", "SmartPlay Pro+", "Premium Hatchback"],
    desc: "Brand new premium hatchback. Seamless driving experience with advanced touch screen infotainment system and climate control.",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"
    ],
    available: true
  },
  {
    id: "innova",
    name: "Innova Crysta Diesel (2023)",
    price: 5000,
    fuel: "Diesel",
    transmission: "Manual",
    seats: 7,
    limit: "300 KM Limit",
    specs: ["Diesel Engine", "300 KM Limit", "Premium Captain Seats", "Powerful Performance", "Spacious Boot"],
    desc: "The ultimate road trip MPV. Powerful diesel engine, unmatched seating comfort, and massive road presence.",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80"
    ],
    available: true
  },
  {
    id: "thar",
    name: "Thar Roxx 5 Door",
    price: 5000,
    fuel: "Diesel",
    transmission: "Automatic",
    seats: 5,
    limit: "No Limit",
    specs: ["Brand New", "Diesel SUV", "5 Door Version", "4x4 Drive", "Rugged Offroad Styling"],
    desc: "Brand new Thar Roxx 5-door version. Dominate both highways and rough terrains in pure comfort and style.",
    image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"
    ],
    available: true
  },
  {
    id: "punch",
    name: "Tata Punch",
    price: 2400,
    fuel: "Petrol",
    transmission: "Manual",
    seats: 5,
    limit: "300 KM Limit",
    specs: ["Petrol Manual", "Brand New", "5-Star Safety Rating", "High Ground Clearance", "Compact Size"],
    desc: "Brand new sub-compact SUV. Offers 5-star safety rating and high seating position for city drives.",
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80"
    ],
    available: true
  },
  {
    id: "brezza2023",
    name: "Breeza Smart Hybrid 2023",
    price: 2400,
    fuel: "Petrol",
    transmission: "Manual",
    seats: 5,
    limit: "300 KM Limit",
    specs: ["Petrol Version", "Smart Hybrid", "High Fuel Efficiency", "Spacious Cabin", "Well Maintained"],
    desc: "Smart Hybrid technology for superior fuel efficiency. Clean, spacious, and reliable SUV for long tours.",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"
    ],
    available: true
  },
  {
    id: "swift",
    name: "New Swift",
    price: 2000,
    fuel: "Petrol",
    transmission: "Manual",
    seats: 5,
    limit: "300 KM Limit",
    specs: ["Brand New", "Petrol", "Easy Parking", "Sporty Look", "Fun to Drive"],
    desc: "Brand new sleek petrol hatchback. Agile handling, brand new sporty design, and incredibly easy to park.",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"
    ],
    available: true
  },
  {
    id: "xuv700ax5",
    name: "XUV700 AX5 Diesel",
    price: 5500,
    fuel: "Diesel",
    transmission: "Manual",
    seats: 7,
    limit: "300 KM Limit",
    specs: ["Diesel SUV", "300 KM Limit", "Adrenox Connected Car Tech", "Skyroof", "Premium Seating"],
    desc: "Power packed luxury SUV with smart technology. Adrenox intelligence system and premium seating configurations.",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
    ],
    available: true
  },
  {
    id: "seltos",
    name: "Kia Seltos Diesel",
    price: 3000,
    fuel: "Diesel",
    transmission: "Automatic",
    seats: 5,
    limit: "300 KM Limit",
    specs: ["Diesel Engine", "Automatic Transmission", "12 Hours Rate: ₹2000", "24 Hours Rate: ₹3000", "Sleek Look"],
    desc: "Premium SUV with 12 Hours / 24 Hours flexible options. Experience smooth automatic transmission and diesel efficiency.",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"
    ],
    available: true
  },
  {
    id: "xl6",
    name: "XL6 Automatic",
    price: 3000,
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 6,
    limit: "300 KM Limit",
    specs: ["6 Seater", "Automatic", "Captain Seats", "Ventilated Front Seats", "Premium Ride"],
    desc: "Premium 6-seater captain seat configuration. Smooth automatic gearbox for stress-free long journeys.",
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80"
    ],
    available: true
  },
  {
    id: "i10nios",
    name: "Grand i10 Nios",
    price: 2000,
    fuel: "Petrol",
    transmission: "Manual",
    seats: 5,
    limit: "300 KM Limit",
    specs: ["Petrol Engine", "300 KM Limit", "Compact City Car", "Highly Reliable", "Cozy Cabin"],
    desc: "Smart hatchback for city and highway rides. Clean interiors, very responsive steering, and incredible ride stability.",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80"
    ],
    available: true
  },
  {
    id: "altroz",
    name: "Tata Altroz",
    price: 2400,
    fuel: "Diesel",
    transmission: "Manual",
    seats: 5,
    limit: "300 KM Limit",
    specs: ["XZ+ Premium Variant", "Diesel Torque", "300 KM Limit", "Harman Sound System", "5-Star Safety Build"],
    desc: "Premium XZ+ variant. Solid 5-star safety build, rich sound system, and powerful diesel torque.",
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80"
    ],
    available: true
  },
  {
    id: "xuv700ax7",
    name: "XUV700 AX7",
    price: 5500,
    fuel: "Diesel",
    transmission: "Automatic",
    seats: 7,
    limit: "300 KM Limit",
    specs: ["Top Luxury Model", "Automatic Transmission", "Panoramic Sunroof", "ADAS Features", "7 Seater"],
    desc: "Top of the line luxury SUV with advanced driver-assist systems (ADAS) and panoramic sunroof.",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
    ],
    available: true
  }
];

// Firebase Config Check
const isFirebaseConfigured = true;

// ----------------------------------------------------
// LOCALSTORAGE FALLBACK ENGINE
// ----------------------------------------------------

const getLocalStorageData = (key, defaultValue) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(data);
};

const setLocalStorageData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Seed Local Database if empty or outdated
const seedLocalDb = () => {
  const cachedCars = localStorage.getItem("rks_cars");
  if (!cachedCars || JSON.parse(cachedCars).length < DEFAULT_CARS.length) {
    setLocalStorageData("rks_cars", DEFAULT_CARS);
  } else {
    getLocalStorageData("rks_cars", DEFAULT_CARS);
  }
  getLocalStorageData("rks_users", [
    {
      uid: "user-1",
      email: "sai@rks.com",
      name: "Sai",
      role: "admin",
      phone: "+91 8019687186",
      joined: "2021-06-15"
    },
    {
      uid: "user-2",
      email: "test@user.com",
      name: "John Doe",
      role: "customer",
      phone: "+91 9999999999",
      dlUrl: "",
      aadhaarUrl: ""
    }
  ]);
  
  // Seed sample bookings
  getLocalStorageData("rks_bookings", [
    {
      id: "booking-101",
      customerUid: "user-2",
      customerName: "John Doe",
      customerPhone: "+91 9999999999",
      careOf: "Robert Doe",
      referenceName: "Jane Doe",
      referencePhone: "+91 8888888888",
      address: "Banjara Hills, Road No. 10, Hyderabad",
      dob: "1995-08-20",
      carId: "brezza2025",
      carName: "Brezza 2025",
      carImage: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
      days: 3,
      departureDate: "2026-07-20",
      departureTime: "09:00",
      status: "Confirmed",
      createdDate: "2026-07-15T12:00:00.000Z",
      updatedDate: "2026-07-15T12:30:00.000Z",
      extraCharges: 0,
      penalty: 0,
      remarks: "Driver license verified. Security deposit paid.",
      dlUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80",
      aadhaarUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "booking-102",
      customerUid: "user-2",
      customerName: "John Doe",
      customerPhone: "+91 9999999999",
      careOf: "Robert Doe",
      referenceName: "Jane Doe",
      referencePhone: "+91 8888888888",
      address: "Banjara Hills, Road No. 10, Hyderabad",
      dob: "1995-08-20",
      carId: "thar",
      carName: "Thar Roxx 5 Door",
      carImage: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80",
      days: 1,
      departureDate: "2026-07-10",
      departureTime: "10:00",
      status: "Completed",
      createdDate: "2026-07-09T08:00:00.000Z",
      updatedDate: "2026-07-11T11:00:00.000Z",
      extraCharges: 0,
      penalty: 0,
      remarks: "Car returned clean and on time.",
      dlUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80",
      aadhaarUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80"
    }
  ]);

  getLocalStorageData("rks_notifications", [
    {
      id: "notif-1",
      customerUid: "user-2",
      title: "Booking Confirmed",
      body: "Your booking for Brezza 2025 (booking-101) has been approved! Enjoy your drive.",
      timestamp: "2026-07-15T12:30:00.000Z",
      read: false
    }
  ]);
};

// Execute seeding for local browser instance
seedLocalDb();

// ----------------------------------------------------
// UNIFIED AUTH API
// ----------------------------------------------------

export const registerUser = async (email, password, name, phone) => {
  if (isFirebaseConfigured && auth) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const userData = {
      uid: cred.user.uid,
      email,
      name,
      phone,
      role: "customer",
      joined: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "users", cred.user.uid), userData);
    localStorage.setItem("rks_current_user", JSON.stringify(userData));
    return userData;
  } else {
    // Local implementation
    const users = getLocalStorageData("rks_users", []);
    if (users.find(u => u.email === email)) {
      throw new Error("Email already registered!");
    }
    const newUser = {
      uid: "user-" + Math.floor(Math.random() * 10000),
      email,
      name,
      phone,
      role: "customer",
      joined: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    setLocalStorageData("rks_users", users);
    localStorage.setItem("rks_current_user", JSON.stringify(newUser));
    return newUser;
  }
};

export const loginUser = async (email, password) => {
  // Check admin overrides first for local storage config
  if (email === "sai@rks.com" && password === "adminpassword") {
    const adminUser = { uid: "user-1", email: "sai@rks.com", name: "Sai", role: "admin" };
    localStorage.setItem("rks_current_user", JSON.stringify(adminUser));
    return adminUser;
  }

  if (isFirebaseConfigured && auth) {
    // Step 1: Authenticate with Firebase Auth
    const cred = await signInWithEmailAndPassword(auth, email, password);

    // Step 2: Try to read Firestore user profile (may fail if rules not yet configured)
    try {
      const userDoc = await getDoc(doc(db, "users", cred.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        localStorage.setItem("rks_current_user", JSON.stringify(userData));
        return userData;
      }

      const adminDoc = await getDoc(doc(db, "admins", cred.user.uid));
      if (adminDoc.exists()) {
        const adminData = { ...adminDoc.data(), role: "admin" };
        localStorage.setItem("rks_current_user", JSON.stringify(adminData));
        return adminData;
      }
    } catch (firestoreErr) {
      // Firestore rules not configured yet — fall back to Firebase Auth data
      console.warn("Firestore read failed, using Firebase Auth profile:", firestoreErr.message);
    }

    // Step 3: Fallback — build user from Firebase Auth credentials
    const fallbackUser = {
      uid: cred.user.uid,
      email: cred.user.email,
      name: cred.user.displayName || email.split("@")[0],
      role: "customer"
    };
    localStorage.setItem("rks_current_user", JSON.stringify(fallbackUser));
    return fallbackUser;
  } else {
    // Local fallback login
    const users = getLocalStorageData("rks_users", []);
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error("Invalid email or password!");
    }
    localStorage.setItem("rks_current_user", JSON.stringify(user));
    return user;
  }
};


export const logoutUser = async () => {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
  localStorage.removeItem("rks_current_user");
};

export const resetPassword = async (email) => {
  if (isFirebaseConfigured && auth) {
    await sendPasswordResetEmail(auth, email);
  } else {
    // Local mock action
    const users = getLocalStorageData("rks_users", []);
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error("Email not found!");
    }
  }
};

export const getCurrentSessionUser = () => {
  const user = localStorage.getItem("rks_current_user");
  return user ? JSON.parse(user) : null;
};

// ----------------------------------------------------
// UNIFIED DATABASE CRUD API
// ----------------------------------------------------

// Cars management
export const getCars = async () => {
  if (isFirebaseConfigured && db) {
    try {
      const querySnapshot = await getDocs(collection(db, "cars"));
      const list = [];
      querySnapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      if (list.length === 0) {
        // Seed Firebase automatically on first run
        for (const car of DEFAULT_CARS) {
          try {
            await setDoc(doc(db, "cars", car.id), car);
          } catch (e) {
            console.warn("Could not seed car to Firestore", e);
          }
        }
        setLocalStorageData("rks_cars", DEFAULT_CARS);
        return DEFAULT_CARS;
      }
      setLocalStorageData("rks_cars", list);
      return list;
    } catch (err) {
      console.warn("Firestore getCars failed, falling back to local data:", err);
      const local = localStorage.getItem("rks_cars");
      if (!local || JSON.parse(local).length < DEFAULT_CARS.length) {
        setLocalStorageData("rks_cars", DEFAULT_CARS);
        return DEFAULT_CARS;
      }
      return JSON.parse(local);
    }
  } else {
    const local = localStorage.getItem("rks_cars");
    if (!local || JSON.parse(local).length < DEFAULT_CARS.length) {
      setLocalStorageData("rks_cars", DEFAULT_CARS);
      return DEFAULT_CARS;
    }
    return JSON.parse(local);
  }
};

export const saveCar = async (car) => {
  // Always update local storage first so UI updates instantly!
  const cars = getLocalStorageData("rks_cars", DEFAULT_CARS);
  const index = cars.findIndex(c => c.id === car.id);
  if (index >= 0) {
    cars[index] = car;
  } else {
    cars.push(car);
  }
  setLocalStorageData("rks_cars", cars);

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "cars", car.id), car);
    } catch (err) {
      console.warn("Could not save car to Firestore:", err);
    }
  }
};

export const removeCar = async (carId) => {
  let cars = getLocalStorageData("rks_cars", DEFAULT_CARS);
  cars = cars.filter(c => c.id !== carId);
  setLocalStorageData("rks_cars", cars);

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "cars", carId));
    } catch (err) {
      console.warn("Could not delete car from Firestore:", err);
    }
  }
};

// Bookings management
export const getBookings = async () => {
  if (isFirebaseConfigured && db) {
    try {
      const querySnapshot = await getDocs(collection(db, "bookings"));
      const list = [];
      querySnapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      if (list.length === 0) {
        return getLocalStorageData("rks_bookings", []);
      }
      return list;
    } catch (err) {
      console.warn("Firestore getBookings failed, falling back to local data:", err);
      return getLocalStorageData("rks_bookings", []);
    }
  } else {
    return getLocalStorageData("rks_bookings", []);
  }
};

export const getBookingsForUser = async (userUid) => {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "bookings"), where("customerUid", "==", userUid));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    } catch (err) {
      return getLocalStorageData("rks_bookings", []).filter(b => b.customerUid === userUid);
    }
  } else {
    const bookings = getLocalStorageData("rks_bookings", []);
    return bookings.filter(b => b.customerUid === userUid);
  }
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

  // Always update local storage first
  const bookings = getLocalStorageData("rks_bookings", []);
  bookings.push(cleanBooking);
  setLocalStorageData("rks_bookings", bookings);
  
  if (cleanBooking.paymentId) {
    const payments = getLocalStorageData("rks_payments", []);
    payments.push({
      paymentId: cleanBooking.paymentId,
      bookingId: cleanBooking.id,
      customerUid: cleanBooking.customerUid,
      amount: cleanBooking.totalAmount,
      status: cleanBooking.paymentStatus || "Paid",
      timestamp: new Date().toISOString()
    });
    setLocalStorageData("rks_payments", payments);
  }

  addNotification(
    cleanBooking.customerUid,
    "Booking Submitted",
    `Your booking request for ${cleanBooking.carName} has been received successfully.`
  );

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "bookings", cleanBooking.id), cleanBooking);
      
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
    } catch (err) {
      console.warn("Firestore createBooking sync failed:", err);
    }
  }

  return cleanBooking;
};

export const updateBookingStatus = async (bookingId, status, extraFields = {}) => {
  const updatedDate = new Date().toISOString();
  
  // Always update local storage first
  const bookings = getLocalStorageData("rks_bookings", []);
  const index = bookings.findIndex(b => b.id === bookingId);
  if (index >= 0) {
    bookings[index] = {
      ...bookings[index],
      status,
      updatedDate,
      ...extraFields
    };
    setLocalStorageData("rks_bookings", bookings);
    
    const b = bookings[index];
    let notifTitle = `Booking ${status}`;
    let notifBody = `Your booking for ${b.carName} is now ${status}.`;
    if (status === "Over Time") {
      notifTitle = "Over Time Charges Added";
      notifBody = `Over Time charges/penalties have been updated for your booking of ${b.carName}. Please check your dashboard.`;
    }
    addNotification(b.customerUid, notifTitle, notifBody);
  }

  if (isFirebaseConfigured && db) {
    try {
      const bookingDoc = doc(db, "bookings", bookingId);
      await updateDoc(bookingDoc, {
        status,
        updatedDate,
        ...extraFields
      });
    } catch (err) {
      console.warn("Firestore updateBookingStatus sync failed:", err);
    }
  }
};

// Customers list view
export const getCustomers = async () => {
  if (isFirebaseConfigured && db) {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const list = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.role !== "admin") {
          list.push(data);
        }
      });
      if (list.length === 0) {
        const users = getLocalStorageData("rks_users", []);
        return users.filter(u => u.role !== "admin");
      }
      return list;
    } catch (err) {
      console.warn("Firestore getCustomers failed, falling back to local data:", err);
      const users = getLocalStorageData("rks_users", []);
      return users.filter(u => u.role !== "admin");
    }
  } else {
    const users = getLocalStorageData("rks_users", []);
    return users.filter(u => u.role !== "admin");
  }
};

// Notifications management
export const getNotificationsForUser = async (userUid) => {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "notifications"), where("customerUid", "==", userUid));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    } catch (err) {
      console.warn("Firestore getNotificationsForUser failed, falling back to local data:", err);
      const list = getLocalStorageData("rks_notifications", []);
      return list.filter(n => n.customerUid === userUid);
    }
  } else {
    const list = getLocalStorageData("rks_notifications", []);
    return list.filter(n => n.customerUid === userUid);
  }
};

export const addNotification = async (customerUid, title, body) => {
  const notif = {
    id: "notif-" + Math.floor(Math.random() * 100000),
    customerUid,
    title,
    body,
    timestamp: new Date().toISOString(),
    read: false
  };

  // Always update local storage first
  const list = getLocalStorageData("rks_notifications", []);
  list.unshift(notif);
  setLocalStorageData("rks_notifications", list);

  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, "notifications"), notif);
    } catch (err) {
      console.warn("Firestore addNotification sync failed:", err);
    }
  }
};

export const markNotificationsAsRead = async (userUid) => {
  // Always update local storage first
  const list = getLocalStorageData("rks_notifications", []);
  list.forEach(n => {
    if (n.customerUid === userUid) n.read = true;
  });
  setLocalStorageData("rks_notifications", list);

  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "notifications"), where("customerUid", "==", userUid), where("read", "==", false));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (d) => {
        await updateDoc(doc(db, "notifications", d.id), { read: true });
      });
    } catch (err) {
      console.warn("Firestore markNotificationsAsRead sync failed:", err);
    }
  }
};

// --- CONTACT MESSAGES ---

export const getContactMessages = async () => {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "contactMessages"));
      const querySnapshot = await getDocs(q);
      const messages = [];
      querySnapshot.forEach((docSnap) => messages.push({ id: docSnap.id, ...docSnap.data() }));
      if (messages.length === 0) {
        const list = getLocalStorageData("rks_contact_messages", []);
        return list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }
      return messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (err) {
      console.warn("Firestore getContactMessages failed, falling back to local data:", err);
      const list = getLocalStorageData("rks_contact_messages", []);
      return list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
  } else {
    const list = getLocalStorageData("rks_contact_messages", []);
    return list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
};

export const saveContactMessage = async (messageData) => {
  const message = {
    id: "msg-" + Math.floor(Math.random() * 1000000),
    timestamp: new Date().toISOString(),
    read: false,
    ...messageData
  };

  // Always update local storage first so message appears immediately in Admin Panel!
  const list = getLocalStorageData("rks_contact_messages", []);
  list.unshift(message);
  setLocalStorageData("rks_contact_messages", list);

  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, "contactMessages"), message);
    } catch (err) {
      console.warn("Firestore saveContactMessage sync failed:", err);
    }
  }
};

export const markContactMessageAsRead = async (msgId) => {
  const list = getLocalStorageData("rks_contact_messages", []);
  const idx = list.findIndex(m => m.id === msgId);
  if (idx >= 0) {
    list[idx].read = true;
    setLocalStorageData("rks_contact_messages", list);
  }

  if (isFirebaseConfigured && db) {
    try {
      const msgRef = doc(db, "contactMessages", msgId);
      await updateDoc(msgRef, { read: true });
    } catch (err) {
      console.warn("Firestore markContactMessageAsRead failed:", err);
    }
  }
};

// --- USER MANAGEMENT UTILITIES ---

export const createUser = async (uid, userData) => {
  const userRef = doc(db, "users", uid);
  const cleanData = {
    uid,
    name: userData.name || "",
    email: userData.email || "",
    phone: userData.phone || "",
    role: userData.role || "customer",
    createdAt: userData.createdAt || new Date().toISOString(),
    joined: userData.joined || new Date().toISOString()
  };
  
  if (isFirebaseConfigured && db) {
    await setDoc(userRef, cleanData);
  } else {
    const users = getLocalStorageData("rks_users", []);
    const idx = users.findIndex(u => u.uid === uid);
    if (idx >= 0) {
      users[idx] = cleanData;
    } else {
      users.push(cleanData);
    }
    setLocalStorageData("rks_users", users);
  }
  return cleanData;
};

export const getCurrentUser = async (uid) => {
  if (isFirebaseConfigured && db) {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    const adminDoc = await getDoc(doc(db, "admins", uid));
    if (adminDoc.exists()) {
      return { id: adminDoc.id, ...adminDoc.data(), role: "admin" };
    }
    return null;
  } else {
    const users = getLocalStorageData("rks_users", []);
    const u = users.find(user => user.uid === uid);
    return u || null;
  }
};

export const updateUser = async (uid, updateFields) => {
  if (isFirebaseConfigured && db) {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, updateFields);
    const updatedDoc = await getDoc(userRef);
    return updatedDoc.exists() ? { id: updatedDoc.id, ...updatedDoc.data() } : null;
  } else {
    const users = getLocalStorageData("rks_users", []);
    const idx = users.findIndex(u => u.uid === uid);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...updateFields };
      setLocalStorageData("rks_users", users);
      return users[idx];
    }
    return null;
  }
};
