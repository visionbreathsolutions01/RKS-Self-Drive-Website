import { db } from "../firebaseConfig";
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where 
} from "firebase/firestore";

export const createPayment = async (paymentData) => {
  const cleanPayment = {
    paymentId: paymentData.paymentId,
    bookingId: paymentData.bookingId,
    customerUid: paymentData.customerUid,
    amount: Number(paymentData.amount),
    status: paymentData.status || "Paid",
    timestamp: paymentData.timestamp || new Date().toISOString()
  };

  await setDoc(doc(db, "payments", cleanPayment.paymentId), cleanPayment);
  return cleanPayment;
};

export const getPaymentDetails = async (paymentId) => {
  const paymentDoc = await getDoc(doc(db, "payments", paymentId));
  return paymentDoc.exists() ? { id: paymentDoc.id, ...paymentDoc.data() } : null;
};

export const getPaymentsForUser = async (userUid) => {
  const q = query(collection(db, "payments"), where("customerUid", "==", userUid));
  const querySnapshot = await getDocs(q);
  const list = [];
  querySnapshot.forEach(docSnap => {
    list.push({ id: docSnap.id, ...docSnap.data() });
  });
  return list;
};

export const getAllPayments = async () => {
  const querySnapshot = await getDocs(collection(db, "payments"));
  const list = [];
  querySnapshot.forEach(docSnap => {
    list.push({ id: docSnap.id, ...docSnap.data() });
  });
  return list;
};
