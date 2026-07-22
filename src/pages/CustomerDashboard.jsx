// src/pages/CustomerDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getBookingsForUser, saveCar, addNotification } from "../services/db";
import { 
  Car, Calendar, Clock, FileText, User, Bell, Printer, 
  AlertTriangle, Check, ShieldCheck, Landmark, ShieldAlert, ArrowRight, Eye, X, MapPin 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomerDashboard() {
  const { user, notifications, refreshNotifications, clearUnreadCount } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  
  // Reference for print container
  const printRef = useRef(null);

  // Check auth
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchUserBookings();
    clearUnreadCount(); // clear notifications unread on dashboard visit
  }, [user]);

  const fetchUserBookings = async () => {
    if (!user) return;
    try {
      const list = await getBookingsForUser(user.uid);
      // Sort bookings: newest first
      setBookings(list.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrintReceipt = (booking) => {
    setSelectedReceipt(booking);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Status colors utility
  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Pending Approval</span>;
      case "Confirmed":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Confirmed</span>;
      case "Completed":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Completed</span>;
      case "Cancelled":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Cancelled</span>;
      case "Over Time":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 animate-pulse">Over Time</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const getStats = () => {
    const total = bookings.length;
    const active = bookings.filter(b => b.status === "Confirmed" || b.status === "Over Time").length;
    const spent = bookings
      .filter(b => b.status === "Completed" || b.status === "Confirmed" || b.status === "Over Time")
      .reduce((acc, curr) => {
        const base = curr.days * 2000; // rough estimation fallback or exact if available
        const penaltyTotal = Number(curr.lateCharges || 0) + Number(curr.penaltyAmount || 0) + Number(curr.additionalCharges || 0);
        return acc + base + penaltyTotal;
      }, 0);

    return { total, active, spent };
  };

  const stats = getStats();

  return (
    <div className="bg-bg-light min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dashboard Title Banner */}
        <div className="bg-primary rounded-3xl p-8 mb-12 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between border border-white/5">
          <div>
            <span className="text-xs text-accent font-bold uppercase tracking-widest block mb-2">Member Workspace</span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">Hello, {user?.name || "Customer"}</h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 font-light">
              Registered Phone: {user?.phone} | Account Joined: {user?.joined ? new Date(user.joined).toLocaleDateString() : "2021"}
            </p>
          </div>
          <button 
            onClick={() => navigate("/cars")}
            className="mt-6 md:mt-0 px-6 py-3 rounded-xl bg-accent hover:bg-amber-500 text-primary font-bold text-xs uppercase tracking-wider transition-transform hover:scale-105 cursor-pointer"
          >
            Rent Another Car
          </button>
        </div>

        {/* Outer Grid Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* TAB SYSTEM SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-sm flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex-shrink-0 flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-bold w-full transition-all text-left ${
                  activeTab === "overview" ? "bg-accent/15 text-accent" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Landmark className="h-4.5 w-4.5" />
                <span>Overview Stats</span>
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`flex-shrink-0 flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-bold w-full transition-all text-left ${
                  activeTab === "bookings" ? "bg-accent/15 text-accent" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Car className="h-4.5 w-4.5" />
                <span>My Bookings</span>
              </button>
              <button
                onClick={() => setActiveTab("documents")}
                className={`flex-shrink-0 flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-bold w-full transition-all text-left ${
                  activeTab === "documents" ? "bg-accent/15 text-accent" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <FileText className="h-4.5 w-4.5" />
                <span>Uploaded Documents</span>
              </button>
            </div>
          </div>

          {/* TAB DETAILED PANELS */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* A. OVERVIEW TABS */}
            {activeTab === "overview" && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Mini Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-200/50 shadow-sm">
                    <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider block mb-1">Total Bookings</span>
                    <span className="text-3xl font-extrabold text-primary">{stats.total}</span>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-200/50 shadow-sm">
                    <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider block mb-1">Active / Approved</span>
                    <span className="text-3xl font-extrabold text-green-600">{stats.active}</span>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-200/50 shadow-sm">
                    <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider block mb-1">Estimated Spent</span>
                    <span className="text-3xl font-extrabold text-accent">₹{stats.spent}</span>
                  </div>
                </div>

                {/* Direct action list: Recent Bookings */}
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 sm:p-8">
                  <h3 className="text-base font-bold text-primary mb-6">Recent Bookings Summary</h3>
                  {bookings.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-sm">
                      No active bookings. Choose a car to get started.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {bookings.slice(0, 3).map(booking => (
                        <div key={booking.id} className="py-4 flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center space-x-4">
                            <img src={booking.carImage} alt={booking.carName} className="w-16 h-12 object-cover rounded-xl bg-gray-50 border" />
                            <div>
                              <h4 className="text-sm font-bold text-primary">{booking.carName}</h4>
                              <span className="text-xs text-gray-400">Departure: {booking.departureDate} | {booking.days} Day(s)</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            {getStatusBadge(booking.status)}
                            <button 
                              onClick={() => {
                                setSelectedReceipt(booking);
                                handlePrintReceipt(booking);
                              }}
                              className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-500 cursor-pointer"
                              title="Print Receipt"
                            >
                              <Printer className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* B. MY BOOKINGS */}
            {activeTab === "bookings" && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {bookings.length === 0 ? (
                  <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm text-gray-400 text-sm">
                    You have not placed any rental requests yet.
                  </div>
                ) : (
                  bookings.map(booking => {
                    const penaltyTotal = Number(booking.lateCharges || 0) + Number(booking.penaltyAmount || 0) + Number(booking.additionalCharges || 0);
                    return (
                      <div key={booking.id} className="bg-white p-6 rounded-2xl border border-gray-200/50 shadow-sm flex flex-col justify-between relative overflow-hidden">
                        
                        {/* Status top row */}
                        <div className="flex items-center justify-between border-b pb-4 mb-6 flex-wrap gap-4">
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Booking ID</span>
                            <h4 className="text-sm font-bold text-primary">{booking.id}</h4>
                          </div>
                          <div className="flex items-center space-x-3">
                            {getStatusBadge(booking.status)}
                            <button
                              onClick={() => handlePrintReceipt(booking)}
                              className="px-3.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
                            >
                              <Printer className="h-4.5 w-4.5" />
                              <span>Receipt</span>
                            </button>
                          </div>
                        </div>

                        {/* Booking core details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div className="flex items-center space-x-3">
                            <img src={booking.carImage} alt={booking.carName} className="w-20 h-14 object-cover rounded-xl bg-gray-50 border border-gray-100" />
                            <div>
                              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Selected Car</span>
                              <h5 className="text-xs font-bold text-primary">{booking.carName}</h5>
                            </div>
                          </div>
                          <div>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Rental Schedule</span>
                            <span className="text-xs font-semibold text-primary block mt-0.5">{booking.departureDate} at {booking.departureTime}</span>
                            <span className="text-[10px] text-gray-500 block">Duration: {booking.days} Day(s)</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Reference Information</span>
                            <span className="text-xs font-semibold text-primary block mt-0.5">{booking.referenceName}</span>
                            <span className="text-[10px] text-gray-500 block">Mobile: {booking.referencePhone}</span>
                          </div>
                        </div>

                        {/* Overtime Alert Charges (Displayed if Over Time status or there are extra fees) */}
                        {(booking.status === "Over Time" || penaltyTotal > 0) && (
                          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl mb-6 text-xs text-amber-800 space-y-4">
                            <div className="flex items-center space-x-2 font-bold text-amber-900">
                              <AlertTriangle className="h-5 w-5 text-amber-600" />
                              <span>Over Time / Damage Penalty Invoice Details</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                              <div>
                                <span className="block text-[9px] text-amber-600 uppercase font-bold tracking-wider">Extra Hours / KMs</span>
                                <span className="text-xs font-bold text-amber-900">{booking.extraHours || 0} Hrs / {booking.extraKm || 0} KMs</span>
                              </div>
                              <div>
                                <span className="block text-[9px] text-amber-600 uppercase font-bold tracking-wider">Late / Extra KM Charges</span>
                                <span className="text-xs font-bold text-amber-900">₹{booking.lateCharges || 0}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] text-amber-600 uppercase font-bold tracking-wider">Damage Penalty / Penalty</span>
                                <span className="text-xs font-bold text-amber-900">₹{booking.penaltyAmount || 0}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] text-amber-600 uppercase font-bold tracking-wider">Additional / Remarks</span>
                                <span className="text-xs font-bold text-amber-900">₹{booking.additionalCharges || 0}</span>
                              </div>
                            </div>
                            {booking.remarks && (
                              <div className="pt-3 border-t border-amber-200/60">
                                <strong className="text-amber-900">Remarks: </strong>
                                <span className="italic">{booking.remarks}</span>
                              </div>
                            )}
                          </div>
                        )}

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

                        {booking.notes && (
                          <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-500 mt-2">
                            <strong>Additional Notes: </strong> {booking.notes}
                          </div>
                        )}

                      </div>
                    );
                  })
                )}
              </motion.div>
            )}

            {/* C. DOCUMENTS */}
            {activeTab === "documents" && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="bg-white p-8 rounded-3xl border border-gray-200/60 shadow-sm space-y-8"
              >
                <div>
                  <h3 className="text-base font-bold text-primary mb-2">My Verification Documents</h3>
                  <p className="text-xs text-gray-400">
                    Uploaded copies of identity proofs for car bookings. Standard approvals require clear visibility of DL and Aadhaar Card.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* DL Container */}
                  <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
                    <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Driving Licence (DL)</span>
                    {bookings.length > 0 && bookings[0].dlUrl ? (
                      <div className="h-44 w-full rounded-xl overflow-hidden shadow-inner border border-gray-200/50 bg-white">
                        <img src={bookings[0].dlUrl} alt="DL Copy" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-44 w-full rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 bg-white">
                        <ShieldAlert className="h-8 w-8 mb-2 text-gray-300" />
                        <span className="text-xs">No DL Uploaded Yet</span>
                      </div>
                    )}
                  </div>

                  {/* Aadhaar Container */}
                  <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
                    <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Aadhaar Card</span>
                    {bookings.length > 0 && bookings[0].aadhaarUrl ? (
                      <div className="h-44 w-full rounded-xl overflow-hidden shadow-inner border border-gray-200/50 bg-white">
                        <img src={bookings[0].aadhaarUrl} alt="Aadhaar Copy" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-44 w-full rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 bg-white">
                        <ShieldAlert className="h-8 w-8 mb-2 text-gray-300" />
                        <span className="text-xs">No Aadhaar Uploaded Yet</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </div>

        </div>

      </div>

      {/* PRINT-ONLY INVOICE COMPONENT CONTAINER */}
      {selectedReceipt && (
        <div className="hidden print:block fixed inset-0 bg-white text-black p-12 z-50 font-sans text-left" ref={printRef}>
          <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-black tracking-wider">RKS SELF DRIVES</h1>
              <p className="text-xs text-gray-600 mt-1">Sai (Founder) | Established 2021</p>
              <p className="text-xs text-gray-600">Contact: +91 8019687186, +91 6301239187</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold uppercase tracking-wider text-gray-800">Booking Receipt</h2>
              <p className="text-xs font-semibold text-gray-500 mt-1">Receipt ID: {selectedReceipt.id}</p>
              <p className="text-xs text-gray-500">Date: {new Date(selectedReceipt.createdDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8 text-xs">
            <div>
              <h3 className="font-bold border-b pb-1 mb-2 text-gray-800 uppercase tracking-wide">Customer Details</h3>
              <p className="font-bold text-sm text-black">{selectedReceipt.customerName}</p>
              <p className="mt-1">Care Of: {selectedReceipt.careOf}</p>
              <p>Address: {selectedReceipt.address}</p>
              <p>Contact Phone: {selectedReceipt.customerPhone}</p>
            </div>
            <div>
              <h3 className="font-bold border-b pb-1 mb-2 text-gray-800 uppercase tracking-wide">Rental Details</h3>
              <p className="font-bold text-sm text-black">{selectedReceipt.carName}</p>
              <p className="mt-1">Departure: {selectedReceipt.departureDate} at {selectedReceipt.departureTime}</p>
              <p>Duration: {selectedReceipt.days} Day(s)</p>
              <p>Distance Allowance: {selectedReceipt.days * 300} KM</p>
            </div>
          </div>

          <table className="w-full text-xs text-left mb-8 border-collapse">
            <thead>
              <tr className="border-b-2 border-black bg-gray-50">
                <th className="py-2.5 font-bold text-gray-800">Description</th>
                <th className="py-2.5 font-bold text-gray-800 text-right">Units / Rate</th>
                <th className="py-2.5 font-bold text-gray-800 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">Self-Drive Car Daily Rental ({selectedReceipt.carName})</td>
                <td className="py-3 text-right">{selectedReceipt.days} days @ ₹2000/day est.</td>
                <td className="py-3 text-right font-semibold">₹{selectedReceipt.days * 2000}</td>
              </tr>
              {Number(selectedReceipt.lateCharges || 0) > 0 && (
                <tr className="border-b">
                  <td className="py-3">Late / Extra KM Charges ({selectedReceipt.extraHours || 0} hrs / {selectedReceipt.extraKm || 0} kms)</td>
                  <td className="py-3 text-right">-</td>
                  <td className="py-3 text-right font-semibold">₹{selectedReceipt.lateCharges}</td>
                </tr>
              )}
              {Number(selectedReceipt.penaltyAmount || 0) > 0 && (
                <tr className="border-b text-red-600">
                  <td className="py-3">Vehicle Damage Penalty Amount / Penalties</td>
                  <td className="py-3 text-right">-</td>
                  <td className="py-3 text-right font-semibold">₹{selectedReceipt.penaltyAmount}</td>
                </tr>
              )}
              {Number(selectedReceipt.additionalCharges || 0) > 0 && (
                <tr className="border-b">
                  <td className="py-3">Additional Operational Fees</td>
                  <td className="py-3 text-right">-</td>
                  <td className="py-3 text-right font-semibold">₹{selectedReceipt.additionalCharges}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="2" className="py-4 font-bold text-sm text-right text-gray-800 uppercase">Grand Total Rent:</td>
                <td className="py-4 font-black text-lg text-right text-black">
                  ₹{selectedReceipt.days * 2000 + Number(selectedReceipt.lateCharges || 0) + Number(selectedReceipt.penaltyAmount || 0) + Number(selectedReceipt.additionalCharges || 0)}
                </td>
              </tr>
            </tfoot>
          </table>

          {selectedReceipt.remarks && (
            <div className="bg-gray-50 border p-4 rounded-xl text-xs text-gray-700 leading-normal mb-8">
              <strong>Invoice Remarks:</strong> {selectedReceipt.remarks}
            </div>
          )}

          <div className="border-t pt-6 text-[10px] text-gray-500 text-center space-y-1">
            <p>This is a computer-generated invoice receipt from RKS Self Drive Cars, Hyderabad.</p>
            <p>Thank you for choosing RKS! Drive Safely.</p>
          </div>
        </div>
      )}

    </div>
  );
}
