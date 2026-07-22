// src/pages/Booking.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCars, createBooking } from "../services/db";
import { useAuth } from "../context/AuthContext";
import {
  checkCarAvailability,
  buildDateStatusMap,
  STATUS_COLORS,
  toDateStr,
} from "../services/availability";
import {
  FileText, Calendar, CalendarDays, Clock, CreditCard, User, Phone,
  MapPin, UploadCloud, CheckCircle, Image as ImageIcon, AlertCircle, AlertTriangle, X,
  Fuel, Gauge, Shield
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const termsList = [
  { title: "1. Driver Documentation", desc: "The renter must provide a valid Driving License, Aadhaar Card/PAN Card, and one additional Government‑issued ID proof before vehicle handover." },
  { title: "2. Payment & Security Deposit", desc: "The renter shall pay the full rental amount and refundable security deposit before taking delivery of the vehicle." },
  { title: "3. Standard Distance Allowance", desc: "The rental includes 300 km per 24 hours, unless otherwise specified in the booking confirmation." },
  { title: "4. Approved Travel Route", desc: "The 300 km/day allowance is applicable only for the approved travel route and destination(s) declared at the time of booking. It does not authorize unrestricted travel to any destination without prior approval from RKS Self Drive Cars." },
  { title: "5. Route Declaration & Penalties", desc: "The customer must inform the intended travel route and destination(s) before vehicle handover. Any travel to a different route, city, or restricted area without prior approval may result in additional rental days, applicable penalties and extra charges, termination of the rental agreement, and forfeiture of the refundable security deposit, where applicable." },
  { title: "6. Extra Kilometre Charges", desc: "Extra kilometres beyond the permitted limit shall be charged as follows: 5‑Seater Vehicles – ₹5 per km; 7‑Seater Vehicles – ₹10 per km." },
  { title: "7. Vehicle Inspection Video", desc: "The customer must inspect the vehicle thoroughly and record a complete video of the vehicle, including the exterior, interior, tyres, fuel level, and odometer reading before leaving the premises." },
  { title: "8. Pre‑Delivery Checks", desc: "The customer is responsible for checking the horn, headlights, indicators, brakes, steering, mirrors, air conditioning, tyres, and all other essential vehicle functions before accepting delivery." },
  { title: "9. Prohibited Substances", desc: "Smoking, consumption of alcohol, narcotic substances, or any illegal activity inside the vehicle is strictly prohibited." },
  { title: "10. DUI Penalty", desc: "Driving under the influence of alcohol or drugs shall result in immediate termination of the rental agreement, a penalty of ₹50,000, and any legal consequences arising therefrom." },
  { title: "11. Authorized Drivers Only", desc: "The vehicle shall not be driven by any person other than the registered renter unless prior written approval has been obtained from RKS Self Drive Cars." },
  { title: "12. Speed Limit", desc: "The maximum permitted speed is 120 km/h. Exceeding this speed may attract penalties and may void applicable insurance benefits." },
  { title: "13. Restricted Use Cases", desc: "The vehicle shall not be used for racing, off‑road driving, towing, commercial transport, ride‑sharing services, driving instruction, or any unlawful activity." },
  { title: "14. Traffic & Toll Responsibilities", desc: "The renter shall be solely responsible for all traffic challans, parking fines, toll charges, state entry taxes, FASTag dues, and any penalties incurred during the rental period." },
  { title: "15. Incident Reporting & Repairs", desc: "In the event of an accident, theft, or vehicle breakdown, the customer must immediately inform RKS Self Drive Cars and the nearest Police Station wherever required. Repairs shall only be carried out at an authorized service centre approved by the company. Unauthorized repairs, modifications, repainting, or replacement of parts are strictly prohibited." },
  { title: "16. Damage Liability", desc: "The customer shall be responsible for all damages caused to the vehicle during the rental period, including tyres, clutch, engine, suspension, body panels, interiors, accessories, and any other components damaged due to negligence, misuse, or improper driving." },
  { title: "17. Insurance Claim Conditions", desc: "Insurance assistance may be considered only when the estimated repair cost exceeds ₹2,00,000, a valid Police FIR has been registered, and all insurance documentation and procedures required by the company have been completed. Failure to register an FIR or comply with insurance procedures shall make the customer fully liable for the entire repair cost." },
  { title: "18. Rental Period Continuation", desc: "The rental period continues until the vehicle is returned in clean, road‑worthy, and reusable condition. If the vehicle requires repairs due to customer negligence, rental charges shall continue until the vehicle is restored and available for operation." },
  { title: "19. Late Return Charges", desc: "Late return charges shall apply as follows: 5‑Seater Vehicles – ₹300 per hour; 7‑Seater Vehicles – ₹500 per hour." },
  { title: "20. Cleaning Charges", desc: "The vehicle must be returned in a clean condition. Excessive dirt, interior stains, foul odours, pet hair, or abnormal cleaning requirements shall attract professional cleaning charges." },
  { title: "21. Vehicle Monitoring", desc: "For the safety and security of the vehicle, all RKS Self Drive Cars are equipped with vehicle monitoring technology. The company reserves the right to monitor the vehicle's operational status, movement, and location whenever necessary for security, theft prevention, emergency assistance, or compliance with this agreement." },
  { title: "22. Excluded Expenses", desc: "The rental amount includes vehicle rental charges only. Fuel, toll charges, parking charges, FASTag usage, traffic challans, state entry taxes, and any other travel‑related expenses are excluded and shall be borne entirely by the customer." },
  { title: "23. No Cancellation Policy", desc: "Once the booking has been confirmed and the advance payment has been received, no cancellation, refund, or rescheduling shall be permitted under any circumstances unless expressly approved by the management in writing." },
  { title: "24. Security Deposit Release", desc: "The refundable security deposit shall be released only after inspection of the vehicle and adjustment of any pending rental charges, damages, excess kilometre charges, fuel difference, toll charges, traffic challans, cleaning charges, or any other applicable dues." },
  { title: "25. Termination Rights", desc: "RKS Self Drive Cars reserves the right to cancel or terminate the rental agreement at any time if the customer violates any provision of this agreement or if the vehicle is found to be misused." },
  { title: "26. Jurisdiction", desc: "Any dispute arising out of this rental agreement shall be subject to the exclusive jurisdiction of the competent courts in Hyderabad, Telangana." }
];

export default function Booking() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  const [paymentBookingData, setPaymentBookingData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasViewedTerms, setHasViewedTerms] = useState(false);
  const [hasScrolledTerms, setHasScrolledTerms] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState({});

  // Availability calendar state
  const [dateStatusMap, setDateStatusMap] = useState({});
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Track MIME types for uploaded files so we can render PDF vs image previews correctly
  const [fileTypes, setFileTypes] = useState({ dlUrl: "", aadhaarUrl: "" });

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: "",
    careOf: "",
    contactNumber: "+91 ",
    referenceName: "",
    referencePhone: "",
    address: "",
    dob: "",
    departureDate: "",
    departureTime: "09:00",
    carId: "",
    days: 1,
    dlUrl: "",
    aadhaarUrl: "",
    notes: "",
    pickupLocation: ""
  });

  // Load cars and pre-fill selected car
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const list = await getCars();
        setCars(list);

        // Pre-fill fields from navigation state (featured cars click)
        let prefilledId = "";
        if (location.state && location.state.prefilledCarId) {
          prefilledId = location.state.prefilledCarId;
        }

        if (prefilledId) {
          const car = list.find(c => c.id === prefilledId);
          if (car) {
            setSelectedCar(car);
            setFormData(prev => ({ ...prev, carId: prefilledId }));
          }
        } else if (list.length > 0) {
          setSelectedCar(list[0]);
          setFormData(prev => ({ ...prev, carId: list[0].id }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCars();
  }, [location]);

  // Load real availability calendar whenever car changes
  useEffect(() => {
    if (!selectedCar) return;
    setCalendarLoading(true);
    setAvailabilityError("");
    buildDateStatusMap(selectedCar.id, 14)
      .then(map => setDateStatusMap(map))
      .catch(err => console.warn("Calendar load error:", err))
      .finally(() => setCalendarLoading(false));
  }, [selectedCar]);

  // Autofill user profiles if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || "",
        contactNumber: user.phone || ""
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setAvailabilityError(""); // clear availability error when any date field changes

    if (name === "carId") {
      const car = cars.find(c => c.id === value);
      setSelectedCar(car || null);
    }
  };

  // File upload: store blob URL and track MIME type separately
  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // Revoke any previous object URL to avoid memory leaks
    if (formData[fieldName]) {
      URL.revokeObjectURL(formData[fieldName]);
    }

    const objectUrl = URL.createObjectURL(file);
    const mimeType = file.type; // e.g. "application/pdf" or "image/jpeg"

    setFileTypes(prev => ({ ...prev, [fieldName]: mimeType }));
    setFormData(prev => {
      const updated = { ...prev, [fieldName]: objectUrl };
      if (updated.dlUrl && updated.aadhaarUrl) {
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        }, 300);
      }
      return updated;
    });
  };

  // Helper: render the preview for an uploaded document
  const renderDocPreview = (url, mimeType, label, clearField) => {
    if (!url) return null;
    const isPdf = mimeType === "application/pdf";
    return (
      <div className="relative w-full h-32">
        {isPdf ? (
          <div className="w-full h-full rounded-xl bg-red-50 border border-red-200 flex flex-col items-center justify-center space-y-2">
            <FileText className="h-10 w-10 text-red-500" />
            <span className="text-xs font-bold text-red-600">{label} — PDF Uploaded ✓</span>
          </div>
        ) : (
          <img src={url} alt={`${label} Preview`} className="w-full h-full object-cover rounded-xl" />
        )}
        <button
          type="button"
          onClick={clearField}
          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  };

  // Real availability calendar — reads from Firestore via dateStatusMap
  const renderAvailabilityCalendar = () => {
    const NUM_DAYS = 14;
    const days = [];
    const today = new Date();

    // Status → cell styling
    const cellStyle = {
      Available:  "bg-white border border-gray-200 text-gray-700 hover:border-green-400 cursor-pointer shadow-sm",
      Pending:    "bg-yellow-50 border border-yellow-300 text-yellow-800 cursor-not-allowed",
      Confirmed:  "bg-blue-50 border border-blue-300 text-blue-800 cursor-not-allowed",
      Active:     "bg-purple-50 border border-purple-300 text-purple-800 cursor-not-allowed",
      Completed:  "bg-gray-100 border border-gray-300 text-gray-500 cursor-pointer",
      Maintenance:"bg-orange-50 border border-orange-300 text-orange-800 cursor-not-allowed",
      Blocked:    "bg-red-50 border border-red-300 text-red-800 cursor-not-allowed",
    };
    const isUnavailable = (s) => ["Pending","Confirmed","Active","Blocked","Maintenance"].includes(s);

    if (calendarLoading) {
      return Array.from({ length: NUM_DAYS }).map((_, i) => (
        <div key={i} className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-100 animate-pulse h-14" />
      ));
    }

    for (let i = 0; i < NUM_DAYS; i++) {
      const current = new Date(today);
      current.setDate(today.getDate() + i);
      const formattedDate = toDateStr(current);
      const status = dateStatusMap[formattedDate] || "Available";
      const isSelected = formData.departureDate === formattedDate;
      const unavailable = isUnavailable(status);
      const dayName = current.toLocaleDateString("en-US", { weekday: "short" });
      const dateNum = current.getDate();

      let cls = cellStyle[status] || cellStyle.Available;
      if (isSelected && !unavailable) {
        cls = "bg-white border-2 border-green-500 text-green-700 shadow-md z-10 cursor-pointer";
      }

      days.push(
        <div
          key={i}
          onClick={() => {
            if (!unavailable) {
              setFormData(prev => ({ ...prev, departureDate: formattedDate }));
              setAvailabilityError("");
            }
          }}
          className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold relative group transition-all duration-300 ${cls}`}
          title={`${status} — ${dayName} ${dateNum}`}
        >
          <span className={`text-[9px] uppercase mb-0.5 ${isSelected && !unavailable ? 'text-green-600 font-bold' : 'text-gray-400'}`}>{dayName}</span>
          <span>{dateNum}</span>
          <span className="text-[8px] opacity-0 group-hover:opacity-100 absolute bottom-1 transition-opacity">{status}</span>
        </div>
      );
    }
    return days;
  };


  // Returns red border class if field has an error
  const fe = (field) => fieldErrors[field]
    ? "border-red-400 bg-red-50 focus:border-red-500"
    : "border-gray-200 bg-gray-50 focus:border-accent";

  const validateStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (!selectedCar) {
        setError("Please select a car from the home page or choose a valid option before proceeding.");
        return false;
      }
    } else if (step === 2) {
      if (!formData.fullName) errs.fullName = true;
      if (!formData.careOf) errs.careOf = true;
      if (!formData.contactNumber) errs.contactNumber = true;
      if (!formData.dob) errs.dob = true;
      if (!formData.address) errs.address = true;
      if (!formData.referenceName) errs.referenceName = true;
      if (!formData.referencePhone) errs.referencePhone = true;
      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        setError("Please fill in all highlighted fields before continuing.");
        return false;
      }
    } else if (step === 3) {
      if (!formData.departureDate) errs.departureDate = true;
      if (!formData.departureTime) errs.departureTime = true;
      if (!formData.days) errs.days = true;
      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        setError("Please fill in all highlighted fields before continuing.");
        return false;
      }
    } else if (step === 4) {
      if (!formData.dlUrl || !formData.aadhaarUrl) {
        setError("Please upload both Driving Licence and Aadhaar Card to continue.");
        return false;
      }
    }
    setError("");
    setFieldErrors({});
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setError("");
    setFieldErrors({});
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setAvailabilityError("");

    if (!user) {
      setError("You must be logged in to submit a booking. Redirecting to login...");
      setTimeout(() => {
        navigate("/auth", { state: { from: "/booking" } });
      }, 2500);
      return;
    }

    if (!formData.fullName || !formData.contactNumber || !formData.carId || !formData.dlUrl || !formData.aadhaarUrl) {
      setError("Please fill in all required fields and upload both Driving Licence and Aadhaar documents.");
      return;
    }

    // ── AVAILABILITY CHECK (pre-submit) ──
    setCheckingAvailability(true);
    try {
      const result = await checkCarAvailability(
        formData.carId,
        formData.departureDate,
        formData.departureTime,
        Number(formData.days)
      );
      if (!result.available) {
        const msg =
          result.conflictType === "blocked"
            ? `This vehicle is unavailable for the selected dates due to: ${result.conflictDetail?.reason || "Admin block"}. Please choose different dates or another vehicle.`
            : "This vehicle is already booked for the selected dates. Please choose different dates or another vehicle.";
        setAvailabilityError(msg);
        setCurrentStep(3); // bring user back to step 3 to choose dates
        window.scrollTo({ top: 0, behavior: "smooth" });
        setCheckingAvailability(false);
        return;
      }
    } catch (err) {
      console.warn("Availability check failed:", err);
    } finally {
      setCheckingAvailability(false);
    }

    // Build booking data and show the payment confirmation page
    const bookingData = {
      customerUid: user.uid,
      customerName: formData.fullName,
      customerPhone: formData.contactNumber,
      careOf: formData.careOf,
      referenceName: formData.referenceName,
      referencePhone: formData.referencePhone,
      address: formData.address,
      dob: formData.dob,
      carId: formData.carId,
      carName: selectedCar.name,
      carImage: selectedCar.image,
      days: Number(formData.days),
      departureDate: formData.departureDate,
      departureTime: formData.departureTime,
      dlUrl: formData.dlUrl,
      aadhaarUrl: formData.aadhaarUrl,
      notes: formData.notes,
      totalAmount: estimatedTotal,
      paymentStatus: "Paid",
      paymentId: `RKS-${Date.now()}`,
    };

    setPaymentBookingData(bookingData);
    setShowPaymentPage(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    setAvailabilityError("");
    try {
      // ── SECOND AVAILABILITY CHECK (before final payment) ──
      const result = await checkCarAvailability(
        paymentBookingData.carId,
        paymentBookingData.departureDate,
        paymentBookingData.departureTime,
        Number(paymentBookingData.days)
      );
      if (!result.available) {
        const msg =
          result.conflictType === "blocked"
            ? `This vehicle has been blocked for the selected period (${result.conflictDetail?.reason || "Admin block"}). Please go back and choose different dates.`
            : "This vehicle was booked by another customer just now. Please go back and choose different dates.";
        setAvailabilityError(msg);
        setShowPaymentPage(false);
        setCurrentStep(3);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      await createBooking(paymentBookingData);
      setIsSuccess(true);
      setShowPaymentPage(false);
      confetti({
        particleCount: 180,
        spread: 90,
        origin: { y: 0.6 },
      });
    } catch (err) {
      setError(err.message || "Failed to confirm booking. Please try again.");
      setShowPaymentPage(false);
    } finally {
      setLoading(false);
    }
  };


  /* ── PAYMENT CONFIRMATION PAGE ── */
  if (showPaymentPage && paymentBookingData) {
    return (
      <div className="bg-bg-light min-h-screen py-16 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full mx-4"
        >
          {/* Razorpay-style header */}
          <div className="bg-[#072654] rounded-t-3xl px-8 py-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-blue-300 uppercase tracking-widest font-bold mb-1">Payment Summary</p>
              <h2 className="text-white text-lg font-extrabold">RKS Self Drives</h2>
              <p className="text-blue-300 text-xs mt-0.5">Secure Car Rental Payment</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
              <svg viewBox="0 0 24 24" className="h-8 w-8 fill-white"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm7 3l-5 9h4v3l5-9h-4V6z" /></svg>
            </div>
          </div>

          {/* Amount banner */}
          <div className="bg-[#0e3a7d] px-8 py-5 flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-[10px] uppercase tracking-widest font-bold mb-1">Total Amount Due</p>
              <p className="text-white text-4xl font-black">₹{paymentBookingData.totalAmount}<span className="text-blue-300 text-sm font-normal ml-1">INR</span></p>
            </div>
            <div className="text-right">
              <p className="text-blue-300 text-[10px] font-bold">{paymentBookingData.days} Day(s) Rental</p>
              <p className="text-white text-xs font-semibold mt-0.5">{paymentBookingData.carName}</p>
            </div>
          </div>

          {/* Details card */}
          <div className="bg-white px-8 py-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Customer Name</p>
                <p className="text-sm font-bold text-primary">{paymentBookingData.customerName}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Contact</p>
                <p className="text-sm font-bold text-primary">{paymentBookingData.customerPhone}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Departure Date</p>
                <p className="text-sm font-bold text-primary">{paymentBookingData.departureDate || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Departure Time</p>
                <p className="text-sm font-bold text-primary">{paymentBookingData.departureTime}</p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Rate per day</span>
                <span className="font-semibold text-primary">₹{selectedCar ? selectedCar.price : 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Number of days</span>
                <span className="font-semibold text-primary">{paymentBookingData.days}</span>
              </div>
              <div className="flex justify-between text-sm font-black border-t pt-2 mt-2">
                <span className="text-primary">Total</span>
                <span className="text-[#072654] text-base">₹{paymentBookingData.totalAmount}</span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-3 flex items-center space-x-2 border border-blue-100">
              <svg className="h-4 w-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              <p className="text-[10px] text-blue-600 font-medium">Your payment is 100% secure. Documents will be verified by our team before key handover.</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="bg-white rounded-b-3xl px-8 pb-8 pt-2 space-y-3 border-t border-gray-100">
            <button
              onClick={handleConfirmPayment}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-[#072654] hover:bg-[#0a2f6b] disabled:bg-gray-300 text-white font-black text-sm uppercase tracking-wider shadow-lg transition-transform hover:scale-[1.01] active:scale-95 cursor-pointer"
            >
              {loading ? "Confirming Booking..." : `✓ Confirm & Pay ₹${paymentBookingData.totalAmount}`}
            </button>
            <button
              onClick={() => { setShowPaymentPage(false); setError(""); }}
              className="w-full py-3 rounded-xl border border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              ← Go Back & Edit
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── BOOKING SUCCESS PAGE ── */
  if (isSuccess) {
    return (
      <div className="bg-bg-light min-h-screen py-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden text-center"
        >
          {/* Green top bar */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 py-10 flex flex-col items-center">
            <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Payment Successful!</h2>
            <p className="text-green-100 text-sm mt-1">Your booking is confirmed</p>
          </div>

          <div className="p-8 space-y-4">
            <div className="bg-gray-50 rounded-2xl p-5 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 font-medium">Car Booked</span>
                <span className="font-bold text-primary">{paymentBookingData?.carName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 font-medium">Duration</span>
                <span className="font-bold text-primary">{paymentBookingData?.days} Day(s)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 font-medium">Amount Paid</span>
                <span className="font-black text-green-600 text-base">₹{paymentBookingData?.totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 font-medium">Payment ID</span>
                <span className="font-mono text-xs text-gray-500">{paymentBookingData?.paymentId}</span>
              </div>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed">
              Our team will verify your DL &amp; Aadhaar documents. You will receive a confirmation on your dashboard once approved.
            </p>

            {/* Office Location Link */}
            <a
              href="https://maps.app.goo.gl/5QsYqtx1K7iFGzsP8?g_st=ic"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl p-4 text-left hover:bg-blue-100 transition-colors group cursor-pointer mt-2"
            >
              <div className="flex items-center space-x-3">
                <MapPin className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-blue-900">Pickup Office Location</h4>
                  <p className="text-[10px] text-blue-600/80">Click to view on Google Maps</p>
                </div>
              </div>
              <svg className="h-4 w-4 text-blue-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>


            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 py-3 rounded-xl bg-primary hover:bg-black text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Go to My Dashboard
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 py-3 rounded-xl bg-accent hover:bg-amber-500 text-primary font-bold text-sm transition-colors cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const estimatedTotal = selectedCar ? selectedCar.price * formData.days : 0;

  return (
    <div className="bg-bg-light min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-primary mb-4">
            Book Your Self-Drive Car
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Complete the steps below to register your rental order.
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center space-x-3 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {availabilityError && (
          <div className="mb-8 bg-red-50 border-2 border-red-400 text-red-800 p-5 rounded-xl flex items-start space-x-3 text-sm">
            <AlertTriangle className="h-6 w-6 flex-shrink-0 text-red-500 mt-0.5" />
            <div>
              <p className="font-bold text-red-900 mb-1">Booking Not Available</p>
              <p>{availabilityError}</p>
            </div>
          </div>
        )}

        {/* Stepper progress indicator */}
        <div className="mb-12 bg-white p-6 rounded-3xl border border-gray-200/60 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between relative min-w-[500px] max-w-2xl mx-auto px-4">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />

            {/* Active Progress Line */}
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-accent -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            />

            {[
              { num: 1, label: "Car & Cost" },
              { num: 2, label: "Personal" },
              { num: 3, label: "Logistics" },
              { num: 4, label: "Documents" },
              { num: 5, label: "Checkout" }
            ].map((step) => {
              const isActive = currentStep >= step.num;
              const isCurrent = currentStep === step.num;
              return (
                <div key={step.num} className="flex flex-col items-center relative z-10">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center font-extrabold text-sm border-2 transition-all duration-500 ${isCurrent
                        ? "bg-accent border-accent text-primary shadow-lg shadow-accent/30 scale-110"
                        : isActive
                          ? "bg-primary border-primary text-white"
                          : "bg-white border-gray-200 text-gray-400"
                      }`}
                  >
                    {step.num}
                  </div>
                  <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider mt-2.5 transition-colors duration-300 ${isCurrent ? "text-accent" : isActive ? "text-primary" : "text-gray-400"
                    }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <AnimatePresence mode="wait">
            {/* STEP 1: Booking Estimation */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {selectedCar ? (
                  <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-200/60 shadow-sm">
                    {/* Step header */}
                    <div className="flex items-center space-x-3 border-b pb-4 mb-8">
                      <span className="flex items-center justify-center h-8 w-8 rounded-full bg-accent text-primary text-xs font-black">1</span>
                      <h3 className="text-sm font-bold text-accent uppercase tracking-widest">Booking Estimation</h3>
                    </div>

                    <div>
                      {/* Car preview */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
                        <img
                          src={selectedCar.image}
                          alt={selectedCar.name}
                          className="w-full sm:w-40 h-28 object-cover rounded-2xl bg-gray-50 border border-gray-100"
                        />
                        <div>
                          <h4 className="text-lg font-extrabold text-primary leading-snug">{selectedCar.name}</h4>
                          <p className="text-xs text-accent font-semibold mt-1">{selectedCar.fuel} • {selectedCar.transmission} • {selectedCar.seats} Seater</p>
                          <p className="text-gray-500 text-xs mt-2 leading-relaxed line-clamp-2">{selectedCar.desc}</p>
                        </div>
                      </div>

                      {/* Specifications */}
                      <div className="border-t border-gray-100 pt-6 mb-6">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Specifications</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="flex flex-col bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Year</span>
                            <span className="text-xs text-primary font-bold">{selectedCar.year || "2023"}</span>
                          </div>
                          <div className="flex flex-col bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Odometer</span>
                            <span className="text-xs text-primary font-bold">{selectedCar.odometer || "49,000 km"}</span>
                          </div>
                          <div className="flex flex-col bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Seats</span>
                            <span className="text-xs text-primary font-bold">{selectedCar.seats}</span>
                          </div>
                          <div className="flex flex-col bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Insurance</span>
                            <span className="text-xs text-primary font-bold">{selectedCar.insurance || "Up to Date"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Availability Calendar — real Firestore data */}
                      <div className="border-t border-gray-100 pt-6 mb-6">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center space-x-1.5">
                          <CalendarDays className="h-4 w-4 text-accent" />
                          <span>Availability (Next 14 Days)</span>
                          {calendarLoading && <span className="ml-2 text-[9px] text-gray-300 animate-pulse">Loading...</span>}
                        </h4>
                        <div className="grid grid-cols-7 gap-1.5 bg-gray-50 p-3 rounded-2xl">
                          {renderAvailabilityCalendar()}
                        </div>
                        {/* Legend */}
                        <div className="flex flex-wrap gap-3 mt-3 text-[10px] font-bold text-gray-400">
                          {[
                            { label: "Available", cls: "bg-white border border-gray-300" },
                            { label: "Pending", cls: "bg-yellow-100 border border-yellow-400" },
                            { label: "Confirmed", cls: "bg-blue-100 border border-blue-400" },
                            { label: "Active", cls: "bg-purple-100 border border-purple-400" },
                            { label: "Blocked", cls: "bg-red-100 border border-red-400" },
                          ].map(({ label, cls }) => (
                            <div key={label} className="flex items-center space-x-1.5">
                              <div className={`h-2.5 w-2.5 rounded-full ${cls}`} />
                              <span>{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="border-t border-gray-100 pt-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-6">
                          <div className="flex flex-col">
                            <span className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Daily Rate</span>
                            <span className="font-bold text-primary">₹{selectedCar.price}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Duration</span>
                            <span className="font-bold text-primary">{formData.days} Day(s)</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Distance Limit</span>
                            <span className="font-bold text-primary">{formData.days * 300} KM</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Security Deposit</span>
                            <span className="font-bold text-accent">Paid on pickup</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-5 border border-gray-100">
                          <div>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-bold">Total Rent Est.</span>
                            <span className="text-xs text-gray-400">(Excluding Extra KMs / late charges)</span>
                          </div>
                          <span className="text-3xl font-black text-accent">₹{estimatedTotal}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center text-gray-400 text-sm">
                    Select a car from the options to view cost calculations.
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2 — PERSONAL INFORMATION & REFERENCE CONTACT */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-200/60 shadow-sm space-y-8"
              >
                {/* Step header */}
                <div className="flex items-center space-x-3 border-b pb-4">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-accent text-primary text-xs font-black">2</span>
                  <h3 className="text-sm font-bold text-accent uppercase tracking-widest">Personal Information & Reference Contact</h3>
                </div>

                {/* Personal Information */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Personal Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${fieldErrors.fullName ? 'text-red-500' : 'text-gray-500'}`}>Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter full name"
                        className={`w-full rounded-xl py-2.5 px-4 text-sm focus:outline-none text-primary font-medium border transition-colors ${fe('fullName')}`}
                      />
                      {fieldErrors.fullName && <p className="text-red-500 text-[10px] mt-1 font-semibold">This field is required</p>}
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${fieldErrors.careOf ? 'text-red-500' : 'text-gray-500'}`}>S/O or D/O (Son/Daughter of) *</label>
                      <input
                        type="text"
                        name="careOf"
                        required
                        value={formData.careOf}
                        onChange={handleInputChange}
                        placeholder="Father's/Spouse name"
                        className={`w-full rounded-xl py-2.5 px-4 text-sm focus:outline-none text-primary font-medium border transition-colors ${fe('careOf')}`}
                      />
                      {fieldErrors.careOf && <p className="text-red-500 text-[10px] mt-1 font-semibold">This field is required</p>}
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${fieldErrors.contactNumber ? 'text-red-500' : 'text-gray-500'}`}>Contact Number *</label>
                      <input
                        type="tel"
                        name="contactNumber"
                        required
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        placeholder="Mobile number"
                        className={`w-full rounded-xl py-2.5 px-4 text-sm focus:outline-none text-primary font-medium border transition-colors ${fe('contactNumber')}`}
                      />
                      {fieldErrors.contactNumber && <p className="text-red-500 text-[10px] mt-1 font-semibold">This field is required</p>}
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${fieldErrors.dob ? 'text-red-500' : 'text-gray-500'}`}>Date of Birth *</label>
                      <input
                        type="date"
                        name="dob"
                        required
                        value={formData.dob}
                        onChange={handleInputChange}
                        className={`w-full rounded-xl py-2.5 px-4 text-sm focus:outline-none text-primary font-medium border transition-colors ${fe('dob')}`}
                      />
                      {fieldErrors.dob && <p className="text-red-500 text-[10px] mt-1 font-semibold">This field is required</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${fieldErrors.address ? 'text-red-500' : 'text-gray-500'}`}>Residential Address *</label>
                      <textarea
                        name="address"
                        required
                        rows="2"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Complete address details"
                        className={`w-full rounded-xl py-2.5 px-4 text-sm focus:outline-none text-primary font-medium resize-none border transition-colors ${fe('address')}`}
                      ></textarea>
                      {fieldErrors.address && <p className="text-red-500 text-[10px] mt-1 font-semibold">This field is required</p>}
                    </div>
                  </div>
                </div>

                {/* Reference Contact */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Alternative Number</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${fieldErrors.referenceName ? 'text-red-500' : 'text-gray-500'}`}>Reference Name *</label>
                      <input
                        type="text"
                        name="referenceName"
                        required
                        value={formData.referenceName}
                        onChange={handleInputChange}
                        placeholder="Reference person's name"
                        className={`w-full rounded-xl py-2.5 px-4 text-sm focus:outline-none text-primary font-medium border transition-colors ${fe('referenceName')}`}
                      />
                      {fieldErrors.referenceName && <p className="text-red-500 text-[10px] mt-1 font-semibold">This field is required</p>}
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${fieldErrors.referencePhone ? 'text-red-500' : 'text-gray-500'}`}>Reference Phone Number *</label>
                      <input
                        type="tel"
                        name="referencePhone"
                        required
                        value={formData.referencePhone}
                        onChange={handleInputChange}
                        placeholder="Reference phone"
                        className={`w-full rounded-xl py-2.5 px-4 text-sm focus:outline-none text-primary font-medium border transition-colors ${fe('referencePhone')}`}
                      />
                      {fieldErrors.referencePhone && <p className="text-red-500 text-[10px] mt-1 font-semibold">This field is required</p>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3 — RENTAL LOGISTICS */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-200/60 shadow-sm"
              >
                {/* Step header */}
                <div className="flex items-center space-x-3 border-b pb-4 mb-8">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-accent text-primary text-xs font-black">3</span>
                  <h3 className="text-sm font-bold text-accent uppercase tracking-widest">Rental Logistics</h3>
                </div>

                {/* Selected Car (locked/pre-filled) */}
                {selectedCar && (
                  <div className="mb-8">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Selected Car</label>
                    <div className="flex items-center space-x-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <img
                        src={selectedCar.image}
                        alt={selectedCar.name}
                        className="w-16 h-12 object-cover rounded-lg bg-white border border-gray-100"
                      />
                      <div className="flex-grow">
                        <h4 className="text-sm font-bold text-primary">{selectedCar.name}</h4>
                        <p className="text-[10px] text-gray-500 font-semibold">{selectedCar.fuel} • {selectedCar.transmission} • ₹{selectedCar.price}/day</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold uppercase tracking-wider">
                        Selected
                      </span>
                    </div>
                    {/* Hidden select to keep formData.carId synced */}
                    <select
                      name="carId"
                      value={formData.carId}
                      onChange={handleInputChange}
                      className="hidden"
                    >
                      {cars.map((car) => (
                        <option key={car.id} value={car.id}>
                          {car.name} (₹{car.price}/day)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${fieldErrors.departureDate ? 'text-red-500' : 'text-gray-500'}`}>Departure Date *</label>
                    <input
                      type="date"
                      name="departureDate"
                      required
                      value={formData.departureDate}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl py-2.5 px-4 text-sm focus:outline-none text-primary font-medium border transition-colors ${fe('departureDate')}`}
                    />
                    {fieldErrors.departureDate && <p className="text-red-500 text-[10px] mt-1 font-semibold">This field is required</p>}
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${fieldErrors.departureTime ? 'text-red-500' : 'text-gray-500'}`}>Departure Time *</label>
                    <input
                      type="time"
                      name="departureTime"
                      required
                      value={formData.departureTime}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl py-2.5 px-4 text-sm focus:outline-none text-primary font-medium border transition-colors ${fe('departureTime')}`}
                    />
                    {fieldErrors.departureTime && <p className="text-red-500 text-[10px] mt-1 font-semibold">This field is required</p>}
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${fieldErrors.days ? 'text-red-500' : 'text-gray-500'}`}>Number of Days *</label>
                    <input
                      type="number"
                      name="days"
                      min="1"
                      max="30"
                      required
                      value={formData.days}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl py-2.5 px-4 text-sm focus:outline-none text-primary font-medium border transition-colors ${fe('days')}`}
                    />
                    {fieldErrors.days && <p className="text-red-500 text-[10px] mt-1 font-semibold">This field is required</p>}
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Additional Notes / Remarks</label>
                    <input
                      type="text"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="E.g. airport delivery requests, child seat, etc."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-accent text-primary font-medium"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4 — VERIFICATION DOCUMENTS */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-200/60 shadow-sm"
              >
                {/* Step header */}
                <div className="flex items-center space-x-3 border-b pb-4 mb-6">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-accent text-primary text-xs font-black">4</span>
                  <h3 className="text-sm font-bold text-accent uppercase tracking-widest">Verification Documents</h3>
                </div>

                <p className="text-xs text-gray-400 mb-6">
                  Please upload clear scans or photos of both your Driving Licence and Aadhaar Card. Size must be under 2GB.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* DL Upload */}
                  <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Driving Licence *</span>
                    <div className="border-2 border-dashed border-gray-200 hover:border-accent transition-colors rounded-2xl p-6 text-center relative bg-gray-50 overflow-hidden flex flex-col items-center justify-center min-h-[160px]">
                      {formData.dlUrl ? (
                        renderDocPreview(
                          formData.dlUrl,
                          fileTypes.dlUrl,
                          "Driving Licence",
                          () => { URL.revokeObjectURL(formData.dlUrl); setFormData(prev => ({ ...prev, dlUrl: "" })); setFileTypes(prev => ({ ...prev, dlUrl: "" })); }
                        )
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center">
                          <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                          <span className="text-xs text-gray-500 font-bold block mb-1">Click to Upload DL</span>
                          <span className="text-[10px] text-gray-400">PDF, JPG, PNG up to 2GB</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "dlUrl")}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Aadhaar Upload */}
                  <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Aadhaar Card *</span>
                    <div className="border-2 border-dashed border-gray-200 hover:border-accent transition-colors rounded-2xl p-6 text-center relative bg-gray-50 overflow-hidden flex flex-col items-center justify-center min-h-[160px]">
                      {formData.aadhaarUrl ? (
                        renderDocPreview(
                          formData.aadhaarUrl,
                          fileTypes.aadhaarUrl,
                          "Aadhaar Card",
                          () => { URL.revokeObjectURL(formData.aadhaarUrl); setFormData(prev => ({ ...prev, aadhaarUrl: "" })); setFileTypes(prev => ({ ...prev, aadhaarUrl: "" })); }
                        )
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center">
                          <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                          <span className="text-xs text-gray-500 font-bold block mb-1">Click to Upload Aadhaar</span>
                          <span className="text-[10px] text-gray-400">PDF, JPG, PNG up to 2GB</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "aadhaarUrl")}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5 — TERMS & CONDITIONS & PAYMENT */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Summary Box */}
                <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-200/60 shadow-sm">
                  <div className="flex items-center space-x-3 border-b pb-4 mb-6">
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-accent text-primary text-xs font-black">5</span>
                    <h3 className="text-sm font-bold text-accent uppercase tracking-widest">Order Summary & Checkout</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between border-b pb-3 text-sm">
                      <span className="text-gray-500 font-semibold">Car</span>
                      <span className="text-primary font-bold">{selectedCar?.name}</span>
                    </div>
                    <div className="flex justify-between border-b pb-3 text-sm">
                      <span className="text-gray-500 font-semibold">Duration</span>
                      <span className="text-primary font-bold">{formData.days} Day(s)</span>
                    </div>
                    <div className="flex justify-between border-b pb-3 text-sm">
                      <span className="text-gray-500 font-semibold">Departure</span>
                      <span className="text-primary font-bold">{formData.departureDate} at {formData.departureTime}</span>
                    </div>
                    <div className="flex justify-between border-b pb-3 text-sm">
                      <span className="text-gray-500 font-semibold">Distance Limit</span>
                      <span className="text-primary font-bold">{formData.days * 300} KM</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-primary font-extrabold text-lg">Total Rent Estimate</span>
                      <span className="text-accent font-black text-2xl">₹{estimatedTotal}</span>
                    </div>
                  </div>
                </div>

                {/* Terms Acceptance */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3 flex-1">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={acceptedTerms}
                      disabled={!hasViewedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className={`mt-1 h-5 w-5 rounded border-gray-300 text-accent focus:ring-accent ${hasViewedTerms ? "cursor-pointer" : "cursor-not-allowed opacity-40"}`}
                    />
                    <label htmlFor="terms" className={`text-sm select-none ${hasViewedTerms ? "text-gray-600 cursor-pointer" : "text-gray-400 cursor-not-allowed"}`}>
                      I have read and agree to the <span className="font-bold text-primary">Terms &amp; Conditions</span> of RKS Self Drives, including the security deposit and distance limits.
                      {!hasViewedTerms && <span className="block text-[10px] text-amber-500 font-bold mt-1">⚠ Please open and read the Terms first, then click &ldquo;Understood &amp; Close&rdquo;</span>}
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setShowTermsModal(true); }}
                    className="shrink-0 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-primary font-bold text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                  >
                    View Terms
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 rounded-xl border border-gray-300 text-primary font-bold text-sm tracking-wider uppercase transition-colors hover:bg-gray-50 cursor-pointer"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-8 py-3.5 rounded-xl bg-accent hover:bg-amber-500 text-primary font-black text-sm tracking-wider uppercase shadow-lg shadow-accent/25 transition-transform hover:scale-[1.01] active:scale-95 cursor-pointer"
              >
                Next Step
              </button>
            ) : (
              <div className="flex-grow max-w-xs text-right ml-auto">
                <button
                  type="submit"
                  disabled={loading || checkingAvailability || !acceptedTerms || !hasViewedTerms}
                  className="w-full py-4 rounded-xl bg-accent hover:bg-amber-500 disabled:bg-gray-200 disabled:text-gray-400 text-primary font-black text-base uppercase tracking-wider shadow-lg shadow-accent/25 transition-transform hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center space-x-3"
                >
                  {checkingAvailability ? (
                    <span>Checking Availability...</span>
                  ) : loading ? (
                    <span>Loading Razorpay...</span>
                  ) : (
                    <>
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm7 3l-5 9h4v3l5-9h-4V6z" /></svg>
                      <span>Pay ₹{estimatedTotal} </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

        </form>

      </div>

      {/* ═══════════════════════════════════════════════
          TERMS AND CONDITIONS MODAL
      ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 shadow-2xl relative"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-extrabold text-primary">Rental Agreement</h3>
                  <p className="text-xs text-gray-500 mt-1">Please read the terms carefully.</p>
                </div>
                <button
                  onClick={() => { setShowTermsModal(false); setHasScrolledTerms(false); }}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Body with scroll */}
              <div
                className="flex-1 overflow-y-auto p-6 md:p-8"
                onScroll={(e) => {
                  const el = e.currentTarget;
                  const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
                  if (isAtBottom) setHasScrolledTerms(true);
                }}
              >
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-8 flex items-start space-x-4 text-left">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-900 uppercase tracking-wide">Important Travel Warning</h4>
                    <p className="text-xs text-amber-800 leading-normal mt-1">
                      Violating the speed limit (120 KM/H), driving under the influence of alcohol, or sub-leasing the car triggers immediate forfeiture of security deposits and lease termination. Always inspect your car before key pickup.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {termsList.map((term, index) => (
                    <div key={index} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-left">
                      <span className="inline-flex h-6 w-6 rounded-full bg-accent/20 text-accent text-[10px] font-black items-center justify-center mb-3">
                        {index + 1}
                      </span>
                      <h4 className="font-extrabold text-sm text-primary mb-2">{term.title}</h4>
                      <p className="text-gray-500 text-xs leading-relaxed">{term.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-center text-xs text-gray-400">
                  Showing top 10 key terms. For the complete list, visit our <a href="/terms" target="_blank" rel="noreferrer" className="text-accent underline font-bold">Full Terms & Conditions</a> page.
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
                {!hasScrolledTerms ? (
                  <p className="text-xs text-amber-600 font-semibold flex items-center gap-1.5">
                    <span>⬇</span> Scroll to the bottom to confirm you've read all terms
                  </p>
                ) : (
                  <p className="text-xs text-green-600 font-semibold flex items-center gap-1.5">
                    <span>✓</span> You've read all terms — click Understood to confirm
                  </p>
                )}
                <button
                  disabled={!hasScrolledTerms}
                  onClick={() => { setHasViewedTerms(true); setShowTermsModal(false); setHasScrolledTerms(false); }}
                  className={`px-6 py-3 rounded-xl font-bold text-sm tracking-wider transition-all cursor-pointer ${
                    hasScrolledTerms
                      ? "bg-primary hover:bg-black text-accent"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Understood &amp; Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

