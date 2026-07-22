import { db } from "../firebaseConfig";
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  collection 
} from "firebase/firestore";

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
  await setDoc(userRef, cleanData);
  return cleanData;
};

export const getCurrentUser = async (uid) => {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() };
  }
  const adminDoc = await getDoc(doc(db, "admins", uid));
  if (adminDoc.exists()) {
    return { id: adminDoc.id, ...adminDoc.data(), role: "admin" };
  }
  return null;
};

export const updateUser = async (uid, updateFields) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, updateFields);
  const updatedDoc = await getDoc(userRef);
  return updatedDoc.exists() ? { id: updatedDoc.id, ...updatedDoc.data() } : null;
};

export const getCustomers = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  const list = [];
  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.role !== "admin") {
      list.push({ id: docSnap.id, ...data });
    }
  });
  return list;
};
