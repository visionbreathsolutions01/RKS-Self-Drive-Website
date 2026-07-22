import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const registerUser = async (email, password, name, phone) => {
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
};

export const loginUser = async (email, password) => {
  // Check local admin bypass overrides first
  if (email === "sai@rks.com" && password === "adminpassword") {
    const adminUser = { uid: "user-1", email: "sai@rks.com", name: "Sai", role: "admin" };
    localStorage.setItem("rks_current_user", JSON.stringify(adminUser));
    return adminUser;
  }

  const cred = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, "users", cred.user.uid));
  
  if (userDoc.exists()) {
    const userData = userDoc.data();
    localStorage.setItem("rks_current_user", JSON.stringify(userData));
    return userData;
  } else {
    const adminDoc = await getDoc(doc(db, "admins", cred.user.uid));
    if (adminDoc.exists()) {
      const adminData = { ...adminDoc.data(), role: "admin" };
      localStorage.setItem("rks_current_user", JSON.stringify(adminData));
      return adminData;
    }
  }
  throw new Error("User record not found in Database.");
};

export const logoutUser = async () => {
  await signOut(auth);
  localStorage.removeItem("rks_current_user");
};

export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

export const getCurrentSessionUser = () => {
  const user = localStorage.getItem("rks_current_user");
  return user ? JSON.parse(user) : null;
};
