// src/pages/AdminDashboard.jsx — RKS Self Drives Admin Portal
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  getCars, saveCar, removeCar, getBookings, 
  updateBookingStatus, getCustomers, getContactMessages, markContactMessageAsRead
} from "../services/db";
import {
  createBlockedPeriod,
  deleteBlockedPeriod,
  getBlockedPeriodsForCar,
  getAllBookingsForCar,
  getCarCurrentStatus,
  getNextAvailableDate,
  buildDateStatusMap,
  toDateStr,
} from "../services/availability";
import { 
  Users, Car, Calendar, DollarSign, Clock, ShieldAlert,
  Edit, Trash2, Plus, X, Check, Trash, Eye, Settings, FileText, AlertTriangle, MessageSquare, ChevronRight, Menu,
  Ban, CalendarDays, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Data States
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cars, setCars] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);

  // UI States
  const [activeSection, setActiveSection] = useState("bookings");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit / Add Car modal state
  const [showCarModal, setShowCarModal] = useState(false);
  const [deleteConfirmCar, setDeleteConfirmCar] = useState(null);
  const [editingCar, setEditingCar] = useState(null); // null if adding
  const [carForm, setCarForm] = useState({
    id: "",
    name: "",
    price: 2000,
    fuel: "Petrol",
    transmission: "Manual",
    seats: 5,
    limit: "300 KM Limit",
    desc: "",
    galleryUrls: ["", "", "", ""],
    specs: "",
    available: true
  });

  // Overtime Modal State
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [overtimeForm, setOvertimeForm] = useState({
    extraHours: 0,
    extraKm: 0,
    lateCharges: 0,
    penaltyAmount: 0,
    additionalCharges: 0,
    remarks: ""
  });

  // DL/Aadhaar Lightbox State
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState(null);

  // ── Vehicle Availability State ──
  const [availCar, setAvailCar] = useState(null); // selected car for availability view
  const [availDateMap, setAvailDateMap] = useState({});
  const [availCarStatus, setAvailCarStatus] = useState(null);
  const [availNextDate, setAvailNextDate] = useState(null);
  const [availBookings, setAvailBookings] = useState([]);
  const [availBlocks, setAvailBlocks] = useState([]);
  const [availLoading, setAvailLoading] = useState(false);
  const [blockForm, setBlockForm] = useState({
    startDate: "",
    endDate: "",
    reason: "Maintenance",
    notes: "",
  });
  const [blockSuccess, setBlockSuccess] = useState("");
  const [blockError, setBlockError] = useState("");

  // Authenticate Admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const bList = await getBookings();
      setBookings((bList || []).sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)));
    } catch (err) {
      console.warn("Could not load bookings from database:", err);
    }

    try {
      const cList = await getCustomers();
      setCustomers(cList || []);
    } catch (err) {
      console.warn("Could not load customers from database:", err);
    }

    try {
      const carList = await getCars();
      setCars(carList || []);
    } catch (err) {
      console.warn("Could not load fleet from database:", err);
    }

    try {
      const msgList = await getContactMessages();
      setContactMessages(msgList || []);
    } catch (err) {
      console.warn("Could not load messages from database:", err);
    }
  };

  // Status updates
  const handleUpdateStatus = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status);
      setSuccess(`Booking status successfully changed to: ${status}`);
      loadData();
    } catch (err) {
      setError("Failed to update status.");
    }
  };

  // Overtime modal save
  const handleSaveOvertime = async (e) => {
    e.preventDefault();
    try {
      const extraFields = {
        extraHours: Number(overtimeForm.extraHours),
        extraKm: Number(overtimeForm.extraKm),
        lateCharges: Number(overtimeForm.lateCharges),
        penaltyAmount: Number(overtimeForm.penaltyAmount),
        additionalCharges: Number(overtimeForm.additionalCharges),
        remarks: overtimeForm.remarks
      };
      await updateBookingStatus(selectedBooking.id, "Over Time", extraFields);
      setSuccess("Overtime charges added successfully! Customer dashboard updated.");
      setShowOvertimeModal(false);
      loadData();
    } catch (err) {
      setError("Failed to apply overtime adjustments.");
    }
  };

  // Car Management Saves
  const handleCarSubmit = async (e) => {
    e.preventDefault();
    const filledUrls = carForm.galleryUrls.filter(u => u.trim() !== "");
    if (filledUrls.length === 0) {
      setError("At least 1 car image URL is required.");
      return;
    }
    try {
      const formattedCar = {
        ...carForm,
        id: carForm.id || carForm.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        price: Number(carForm.price),
        seats: Number(carForm.seats),
        specs: typeof carForm.specs === "string" 
          ? carForm.specs.split(",").map(s => s.trim()) 
          : carForm.specs,
        image: filledUrls[0],
        gallery: filledUrls
      };
      delete formattedCar.galleryUrls;

      await saveCar(formattedCar);
      setSuccess(editingCar ? "Car updated successfully." : "Car added successfully to fleet.");
      setShowCarModal(false);
      loadData();
    } catch (err) {
      setError("Failed to save car fleet details.");
    }
  };

  const handleEditCarClick = (car) => {
    setEditingCar(car);
    const existingGallery = car.gallery && car.gallery.length > 0 ? car.gallery : [car.image || ""];
    const galleryUrls = [...existingGallery, "", "", "", ""].slice(0, 4);
    setCarForm({
      id: car.id,
      name: car.name,
      price: car.price,
      fuel: car.fuel,
      transmission: car.transmission,
      seats: car.seats,
      limit: car.limit,
      desc: car.desc,
      galleryUrls,
      specs: car.specs.join(", "),
      available: car.available
    });
    setShowCarModal(true);
  };

  const handleAddCarClick = () => {
    setEditingCar(null);
    setCarForm({
      id: "",
      name: "",
      price: 2000,
      fuel: "Petrol",
      transmission: "Manual",
      seats: 5,
      limit: "300 KM Limit",
      desc: "",
      galleryUrls: ["", "", "", ""],
      specs: "",
      available: true
    });
    setShowCarModal(true);
  };

  const handleDeleteCar = (car) => {
    setDeleteConfirmCar(car);
  };

  const executeDeleteCar = async () => {
    if (!deleteConfirmCar) return;
    try {
      await removeCar(deleteConfirmCar.id);
      setSuccess("Car deleted successfully.");
      setDeleteConfirmCar(null);
      loadData();
    } catch (err) {
      setError("Failed to delete car.");
      setDeleteConfirmCar(null);
    }
  };

  // Overtime Trigger click
  const handleOpenOvertime = (booking) => {
    setSelectedBooking(booking);
    setOvertimeForm({
      extraHours: booking.extraHours || 0,
      extraKm: booking.extraKm || 0,
      lateCharges: booking.lateCharges || 0,
      penaltyAmount: booking.penaltyAmount || 0,
      additionalCharges: booking.additionalCharges || 0,
      remarks: booking.remarks || ""
    });
    setShowOvertimeModal(true);
  };

  // Lightbox review documents
  const handleOpenDocs = (booking) => {
    const matchedCustomer = customers.find(c => c.uid === booking.customerUid || c.id === booking.customerUid);
    setSelectedDocs({
      name: booking.customerName || (matchedCustomer && (matchedCustomer.name || matchedCustomer.fullName)) || booking.fullName || booking.name || "Customer",
      phone: booking.customerPhone || (matchedCustomer && (matchedCustomer.phone || matchedCustomer.contactNumber)) || booking.contactNumber || booking.phone || "N/A",
      careOf: booking.careOf || "N/A",
      referenceName: booking.referenceName || "N/A",
      referencePhone: booking.referencePhone || "N/A",
      address: booking.address || "N/A",
      dob: booking.dob || "N/A",
      carName: booking.carName || "Vehicle",
      dlUrl: booking.dlUrl || booking.dlFile || booking.drivingLicence || booking.dl,
      aadhaarUrl: booking.aadhaarUrl || booking.aadhaarFile || booking.aadhaar
    });
    setShowDocModal(true);
  };

  // Helper to render uploaded document (Image or PDF) with direct link
  const renderAdminDocViewer = (url, title) => {
    if (!url) {
      return (
        <div className="h-64 w-full bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 text-xs border border-gray-200">
          <FileText className="h-8 w-8 mb-2 text-gray-300" />
          <span>No {title} document uploaded</span>
        </div>
      );
    }

    const isPdf = typeof url === "string" && (url.toLowerCase().includes(".pdf") || url.startsWith("data:application/pdf"));

    return (
      <div className="flex flex-col space-y-2">
        <div className="h-64 w-full bg-black/90 rounded-2xl overflow-hidden border border-gray-200 shadow-inner relative flex items-center justify-center">
          {isPdf ? (
            <iframe src={url} title={title} className="w-full h-full border-none" />
          ) : (
            <img
              src={url}
              alt={title}
              className="h-full w-full object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )}
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="w-full py-2.5 rounded-xl bg-primary hover:bg-black text-accent font-bold text-xs uppercase tracking-wider text-center transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
        >
          <Eye className="h-4 w-4" />
          <span>Open Full {title} (New Tab)</span>
        </a>
      </div>
    );
  };

  // Generate Admin summary stats
  const getStats = () => {
    const totalBookings = bookings.length;
    const pendingReview = bookings.filter(b => b.status === "Pending").length;
    const activeFleet = cars.length;
    const totalEarnings = bookings
      .filter(b => b.status === "Completed" || b.status === "Confirmed" || b.status === "Over Time")
      .reduce((sum, b) => {
        const base = b.days * b.price; // or mock standard rent
        const extra = Number(b.lateCharges || 0) + Number(b.penaltyAmount || 0) + Number(b.additionalCharges || 0);
        return sum + (base || b.days * 2000) + extra;
      }, 0);

    return { totalBookings, pendingReview, activeFleet, totalEarnings };
  };

  const adminStats = getStats();
  const unreadMessagesCount = contactMessages.filter(m => !m.read).length;

  const handleReadMessage = async (msgId) => {
    await markContactMessageAsRead(msgId);
    setContactMessages(prev => prev.map(m => m.id === msgId ? { ...m, read: true } : m));
  };

  const navItems = [
    { key: "bookings", label: "Manage Bookings", icon: Calendar, badge: adminStats.pendingReview > 0 ? adminStats.pendingReview : null },
    { key: "fleet", label: "Manage Cars", icon: Car, badge: cars.length },
    { key: "availability", label: "Vehicle Availability", icon: CalendarDays, badge: null },
    { key: "customers", label: "Customers Directory", icon: MessageSquare, badge: unreadMessagesCount > 0 ? unreadMessagesCount : null },
  ];

  return (
    <div className="bg-bg-light min-h-screen">

      {/* Top Header Bar */}
      <div className="bg-primary text-white px-4 sm:px-8 py-5 flex items-center justify-between border-b border-white/5 shadow-lg">
        <div className="flex items-center space-x-4">
          <button
            className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 cursor-pointer transition"
            onClick={() => setSidebarOpen(o => !o)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <span className="text-[10px] text-accent font-bold uppercase tracking-widest block">Central Operations</span>
            <h1 className="text-lg sm:text-xl font-extrabold leading-tight">RKS Admin Control Desk</h1>
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="flex items-center space-x-2 px-4 py-2.5 bg-accent text-primary hover:bg-accent/90 transition-all font-bold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer hover:scale-102 active:scale-98"
        >
          <Eye className="h-4 w-4" />
          <span>Live Website</span>
        </button>
      </div>

      <div className="flex min-h-screen">

        {/* === SIDEBAR === */}
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside className={`fixed lg:sticky top-20 left-0 z-20 h-[calc(100vh-5rem)] w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}>
          <div className="p-6 border-b border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Menu</span>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => { setActiveSection(item.key); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer group ${
                  activeSection === item.key
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-gray-600 hover:bg-gray-100 hover:text-primary"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      activeSection === item.key ? "bg-white/20 text-white" : "bg-accent/20 text-primary"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className={`h-3.5 w-3.5 transition-transform ${
                    activeSection === item.key ? "translate-x-0.5 opacity-100" : "opacity-0 group-hover:opacity-50"
                  }`} />
                </div>
              </button>
            ))}
          </nav>

          {/* Sidebar Stats Summary */}
          <div className="p-4 border-t border-gray-100">
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Total Bookings</span>
                <span className="font-black text-primary text-sm">{adminStats.totalBookings}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Sales Est.</span>
                <span className="font-black text-green-600 text-sm">₹{adminStats.totalEarnings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Pending</span>
                <span className={`font-black text-sm ${adminStats.pendingReview > 0 ? "text-amber-600" : "text-gray-400"}`}>{adminStats.pendingReview}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* === MAIN CONTENT === */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col bg-[#f8f9fa] min-h-screen">
          {/* Message Feeds */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-xs font-semibold flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError("")} className="text-red-500 hover:text-red-700 font-bold">Dismiss</button>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 text-xs font-semibold flex items-center justify-between">
              <span>{success}</span>
              <button onClick={() => setSuccess("")} className="text-green-500 hover:text-green-700 font-bold">Dismiss</button>
            </div>
          )}

          {/* SECTION CONTENT BLOCKS */}
          
          {/* A. MANAGE BOOKINGS */}
          {activeSection === "bookings" && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div>
                  <h2 className="text-xl font-extrabold text-primary">Manage Bookings</h2>
                  <p className="text-xs text-gray-500 mt-1">All customer bookings & status updates</p>
                </div>
              </div>
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm flex flex-col overflow-hidden flex-1">
            {bookings.length === 0 ? (
              <div className="p-16 text-center text-gray-400 text-sm flex-1 flex items-center justify-center">No bookings placed in system.</div>
            ) : (
              <div className="overflow-y-auto overflow-x-auto flex-1">
                <table className="w-full text-left text-xs border-collapse relative">
                  <thead className="sticky top-0 bg-gray-50 shadow-sm border-b border-gray-100 z-10">
                    <tr className="text-gray-400 font-bold uppercase tracking-wider">
                      <th className="p-4">Customer</th>
                      <th className="p-4">Selected Car</th>
                      <th className="p-4">Schedule</th>
                      <th className="p-4">Details</th>
                      <th className="p-4">Documents</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-primary">
                    {bookings.map(booking => {
                      const matchedCust = customers.find(c => c.uid === booking.customerUid || c.id === booking.customerUid);
                      const displayName = booking.customerName || (matchedCust && (matchedCust.name || matchedCust.fullName)) || booking.fullName || booking.name || "Customer";
                      const displayPhone = booking.customerPhone || (matchedCust && (matchedCust.phone || matchedCust.contactNumber)) || booking.contactNumber || booking.phone || "N/A";
                      return (
                        <tr key={booking.id} className="hover:bg-gray-50/50">
                          <td className="p-4">
                            <div className="font-bold text-sm flex items-center text-primary">
                               {displayName}
                               {booking.days > 21 && <AlertTriangle className="h-4 w-4 text-red-600 ml-2" title="Long rental (>3 weeks)" />}
                            </div>
                            <div className="text-[10px] text-gray-500 font-semibold mt-0.5">📞 {displayPhone}</div>
                            <div className="text-[9px] text-gray-400">ID: {booking.customerUid || booking.id}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-primary">{booking.carName}</div>
                            <div className="text-[10px] text-gray-400">₹{booking.price || 2000}/day</div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-primary">{booking.departureDate} at {booking.departureTime}</div>
                            <div className="text-[10px] text-gray-400">Duration: {booking.days} Day(s)</div>
                          </td>
                          <td className="p-4 text-[10px] text-gray-600">
                            <div><span className="font-bold text-gray-700">Address:</span> {booking.address || "N/A"}</div>
                            {booking.careOf && <div><span className="font-bold text-gray-700">C/O:</span> {booking.careOf}</div>}
                            {booking.referenceName && booking.referenceName !== "N/A" && (
                              <div><span className="font-bold text-gray-700">Ref:</span> {booking.referenceName} ({booking.referencePhone || ""})</div>
                            )}
                            {booking.remarks && <div className="mt-1 text-gray-400 italic">{booking.remarks}</div>}
                          </td>
                        <td className="p-4">
                          <button 
                            onClick={() => handleOpenDocs(booking)}
                            className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border text-gray-600 font-bold text-[10px] flex items-center space-x-1 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-accent" />
                            <span>Verify Files</span>
                          </button>
                        </td>
                        <td className="p-4">
                          {booking.status === "Pending" && <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">Pending Approval</span>}
                          {booking.status === "Confirmed" && <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">Confirmed</span>}
                          {booking.status === "Completed" && <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">Completed</span>}
                          {booking.status === "Cancelled" && <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">Cancelled</span>}
                          {booking.status === "Over Time" && <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold">Over Time</span>}
                        </td>
                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                          {booking.status === "Pending" && (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(booking.id, "Confirmed")}
                                className="px-2.5 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold text-[10px] cursor-pointer"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(booking.id, "Cancelled")}
                                className="px-2.5 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {(booking.status === "Confirmed" || booking.status === "Over Time") && (
                            <>
                              <button 
                                onClick={() => handleOpenOvertime(booking)}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-primary font-black text-[10px] cursor-pointer"
                              >
                                Over Time
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(booking.id, "Completed")}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold text-[10px] cursor-pointer"
                              >
                                Complete
                              </button>
                            </>
                          )}
                          {booking.status !== "Cancelled" && (
                            <button 
                              onClick={() => handleUpdateStatus(booking.id, "Cancelled")}
                              className="px-2.5 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-500 font-bold text-[10px] cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                </table>
              </div>
            )}
          </div>
          </div>
        )}

          {/* B. MANAGE CARS */}
          {activeSection === "fleet" && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-primary">Manage Cars</h2>
                  <p className="text-xs text-gray-500 mt-1">Add, edit, or remove cars</p>
                </div>
                <button
                  onClick={handleAddCarClick}
                  className="px-4 py-2.5 rounded-xl bg-accent hover:bg-amber-500 text-primary font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-accent/20"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>Add New Car</span>
                </button>
              </div>
            <div className="overflow-y-auto flex-1 pr-2 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cars.map(car => (
              <div key={car.id} className="bg-white rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="h-44 bg-gray-100 overflow-hidden relative">
                  <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-primary/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-accent font-bold">
                    {car.fuel} • {car.transmission}
                  </div>
                  <div className="absolute top-3 right-3 bg-accent text-primary px-2 py-0.5 rounded text-[10px] font-bold">
                    {car.available ? "Active / Free" : "Unavailable"}
                  </div>
                </div>
                <div className="p-5 flex-grow">
                  <h4 className="font-bold text-sm text-primary mb-1">{car.name}</h4>
                  <p className="text-gray-500 text-[11px] leading-relaxed mb-4 line-clamp-2">{car.desc}</p>
                  <div className="flex justify-between items-end border-t pt-4">
                    <div>
                      <span className="text-[9px] text-gray-400 block font-bold uppercase">Rent Price</span>
                      <span className="text-lg font-black text-primary">₹{car.price} <span className="text-[10px] text-gray-500 font-normal">/ day</span></span>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditCarClick(car)}
                        className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border text-gray-500 cursor-pointer"
                        title="Edit Car"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCar(car)}
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 cursor-pointer"
                        title="Delete Car"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
          </div>
        )}

          {/* C. CUSTOMERS DIRECTORY */}
          {activeSection === "customers" && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-primary">Customers Directory</h2>
                  <p className="text-xs text-gray-500 mt-1">Messages submitted via the Contact page form</p>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-bold text-xs">{contactMessages.length} Message{contactMessages.length !== 1 ? 's' : ''}</span>
              </div>

              {contactMessages.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-16 text-center">
                  <MessageSquare className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm font-semibold">No messages yet</p>
                  <p className="text-gray-400 text-xs mt-1">Customer messages from the Contact page will appear here.</p>
                </div>
              ) : (
                <div className="overflow-y-auto flex-1 pr-2 pb-6 space-y-4">
                  {contactMessages.map((msg, idx) => (
                    <motion.div
                      key={msg.id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      onClick={() => { if (!msg.read && msg.id) handleReadMessage(msg.id); }}
                      className={`rounded-2xl border p-5 transition-all relative ${
                        !msg.read ? "bg-amber-50/40 border-amber-200/80 shadow-md" : "bg-white border-gray-200/60 shadow-sm hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="font-black text-primary text-sm">{(msg.name || '?').charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-bold text-primary text-sm">{msg.name}</p>
                              {!msg.read && (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white uppercase tracking-wider">Unread</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{msg.phone}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-[10px] text-gray-400 font-semibold block">
                            {msg.timestamp ? new Date(msg.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </span>
                        </div>
                      </div>
                      {msg.message && (
                        <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Message</span>
                          <p className="text-sm text-gray-700 leading-relaxed">{msg.message}</p>
                        </div>
                      )}
                      <div className="mt-4 flex items-center justify-between pt-2 border-t border-gray-100/60">
                        <div className="flex items-center space-x-3">
                          <a
                            href={`tel:${msg.phone}`}
                            onClick={() => { if (!msg.read && msg.id) handleReadMessage(msg.id); }}
                            className="px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-bold uppercase tracking-wider hover:bg-black transition cursor-pointer"
                          >
                            Call Customer
                          </a>
                          <a
                            href={`https://wa.me/91${msg.phone?.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => { if (!msg.read && msg.id) handleReadMessage(msg.id); }}
                            className="px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-green-600 transition cursor-pointer"
                          >
                            WhatsApp
                          </a>
                        </div>
                        {!msg.read && msg.id && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleReadMessage(msg.id); }}
                            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                          >
                            Mark as Read
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* D. VEHICLE AVAILABILITY */}
          {activeSection === "availability" && (
            <div className="flex flex-col h-full pb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-primary">Vehicle Availability</h2>
                  <p className="text-xs text-gray-500 mt-1">Manage car schedules, block dates, and view booking calendars</p>
                </div>
              </div>

              {/* Car selector */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 mb-6">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Select Vehicle</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {cars.map(car => {
                    const isSelected = availCar?.id === car.id;
                    return (
                      <button
                        key={car.id}
                        onClick={async () => {
                          setAvailCar(car);
                          setAvailLoading(true);
                          setBlockSuccess("");
                          setBlockError("");
                          const [map, status, nextDate, allBookings, blocks] = await Promise.all([
                            buildDateStatusMap(car.id, 30),
                            getCarCurrentStatus(car.id),
                            getNextAvailableDate(car.id),
                            getAllBookingsForCar(car.id),
                            getBlockedPeriodsForCar(car.id),
                          ]);
                          setAvailDateMap(map);
                          setAvailCarStatus(status);
                          setAvailNextDate(nextDate);
                          setAvailBookings(allBookings.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)));
                          setAvailBlocks(blocks);
                          setAvailLoading(false);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary border-primary text-white shadow-md"
                            : "bg-gray-50 border-gray-200 text-primary hover:border-primary/40"
                        }`}
                      >
                        <p className={`text-xs font-bold leading-snug ${isSelected ? "text-white" : "text-primary"}`}>{car.name}</p>
                        <p className={`text-[10px] mt-0.5 ${isSelected ? "text-white/70" : "text-gray-400"}`}>₹{car.price}/day</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* No car selected placeholder */}
              {!availCar && (
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-12 text-center text-gray-400">
                  <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">Select a vehicle above to view its availability calendar</p>
                </div>
              )}

              {/* Availability content for selected car */}
              {availCar && (
                <div className="space-y-6">
                  {availLoading && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400 text-sm animate-pulse">
                      Loading availability data...
                    </div>
                  )}

                  {!availLoading && (
                    <>
                      {/* Status + Quick Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Current Status */}
                        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Current Status</p>
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            availCarStatus?.status === "Available" ? "bg-green-100 text-green-800" :
                            availCarStatus?.status === "Blocked" ? "bg-red-100 text-red-800" :
                            availCarStatus?.status === "Active" ? "bg-purple-100 text-purple-800" :
                            availCarStatus?.status === "Confirmed" ? "bg-blue-100 text-blue-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {availCarStatus?.status || "Available"}
                          </div>
                          {availCarStatus?.customerName && (
                            <p className="text-xs text-gray-600 mt-2 font-medium">{availCarStatus.customerName}</p>
                          )}
                          {availCarStatus?.reason && (
                            <p className="text-xs text-gray-500 mt-1">{availCarStatus.reason}</p>
                          )}
                        </div>

                        {/* Next Available Date */}
                        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Next Available Date</p>
                          <p className="text-sm font-black text-primary">{availNextDate || "Today"}</p>
                          {availCarStatus?.returnDate && (
                            <p className="text-[10px] text-gray-400 mt-1">Returns: {availCarStatus.returnDate}</p>
                          )}
                        </div>

                        {/* Upcoming Bookings count */}
                        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Total Bookings</p>
                          <p className="text-2xl font-black text-primary">{availBookings.length}</p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {availBookings.filter(b => ["Pending","Confirmed","Active"].includes(b.status)).length} upcoming
                          </p>
                        </div>
                      </div>

                      {/* 30-day Booking Calendar */}
                      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
                        <h3 className="text-sm font-bold text-primary mb-4 flex items-center space-x-2">
                          <CalendarDays className="h-4 w-4 text-accent" />
                          <span>Booking Calendar — {availCar.name} (Next 30 Days)</span>
                        </h3>
                        <div className="grid grid-cols-7 gap-1.5 mb-4">
                          {Array.from({ length: 30 }).map((_, i) => {
                            const d = new Date();
                            d.setDate(d.getDate() + i);
                            const ds = toDateStr(d);
                            const status = availDateMap[ds] || "Available";
                            const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
                            const isToday = i === 0;
                            const colorMap = {
                              Available: "bg-green-50 border-green-200 text-green-800",
                              Pending: "bg-yellow-50 border-yellow-300 text-yellow-800",
                              Confirmed: "bg-blue-50 border-blue-300 text-blue-800",
                              Active: "bg-purple-50 border-purple-300 text-purple-800",
                              Completed: "bg-gray-100 border-gray-200 text-gray-500",
                              Maintenance: "bg-orange-50 border-orange-300 text-orange-800",
                              Blocked: "bg-red-50 border-red-300 text-red-800",
                            };
                            return (
                              <div
                                key={ds}
                                title={`${status} — ${dayName} ${d.getDate()}`}
                                className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-[10px] font-bold ${
                                  colorMap[status] || colorMap.Available
                                } ${isToday ? "ring-2 ring-primary ring-offset-1" : ""}`}
                              >
                                <span className="text-[8px] opacity-60">{dayName}</span>
                                <span>{d.getDate()}</span>
                              </div>
                            );
                          })}
                        </div>
                        {/* Legend */}
                        <div className="flex flex-wrap gap-3 text-[10px] font-bold text-gray-500">
                          {[
                            { label: "Available", cls: "bg-green-100 border-green-300" },
                            { label: "Pending", cls: "bg-yellow-100 border-yellow-300" },
                            { label: "Confirmed", cls: "bg-blue-100 border-blue-300" },
                            { label: "Active", cls: "bg-purple-100 border-purple-300" },
                            { label: "Completed", cls: "bg-gray-100 border-gray-300" },
                            { label: "Blocked", cls: "bg-red-100 border-red-300" },
                          ].map(({ label, cls }) => (
                            <div key={label} className="flex items-center space-x-1.5">
                              <div className={`h-2.5 w-2.5 rounded border ${cls}`} />
                              <span>{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Block Date Range Form */}
                      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
                        <h3 className="text-sm font-bold text-primary mb-1 flex items-center space-x-2">
                          <Ban className="h-4 w-4 text-red-500" />
                          <span>Block Vehicle Dates</span>
                        </h3>
                        <p className="text-[11px] text-gray-400 mb-5">Mark the vehicle as unavailable for maintenance, service, or other reasons. Customers will not be able to book during this period.</p>

                        {blockSuccess && (
                          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl text-xs font-semibold">{blockSuccess}</div>
                        )}
                        {blockError && (
                          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-semibold">{blockError}</div>
                        )}

                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            setBlockError("");
                            setBlockSuccess("");
                            if (!blockForm.startDate || !blockForm.endDate) {
                              setBlockError("Please select both start and end dates.");
                              return;
                            }
                            if (blockForm.endDate < blockForm.startDate) {
                              setBlockError("End date must be on or after start date.");
                              return;
                            }
                            try {
                              const block = await createBlockedPeriod({
                                carId: availCar.id,
                                carName: availCar.name,
                                startDate: blockForm.startDate,
                                endDate: blockForm.endDate,
                                reason: blockForm.reason,
                                notes: blockForm.notes,
                                createdBy: user?.uid || "admin",
                              });
                              setBlockSuccess(`✓ ${availCar.name} blocked from ${blockForm.startDate} to ${blockForm.endDate} (${blockForm.reason}).`);
                              setBlockForm({ startDate: "", endDate: "", reason: "Maintenance", notes: "" });
                              // Refresh
                              const [map, newBlocks] = await Promise.all([
                                buildDateStatusMap(availCar.id, 30),
                                getBlockedPeriodsForCar(availCar.id),
                              ]);
                              setAvailDateMap(map);
                              setAvailBlocks(newBlocks);
                            } catch (err) {
                              setBlockError("Failed to create block. Please try again.");
                            }
                          }}
                          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                        >
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Block From *</label>
                            <input
                              type="date"
                              required
                              value={blockForm.startDate}
                              min={toDateStr(new Date())}
                              onChange={e => setBlockForm(p => ({ ...p, startDate: e.target.value }))}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-red-400 text-primary font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Block Until *</label>
                            <input
                              type="date"
                              required
                              value={blockForm.endDate}
                              min={blockForm.startDate || toDateStr(new Date())}
                              onChange={e => setBlockForm(p => ({ ...p, endDate: e.target.value }))}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-red-400 text-primary font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Reason *</label>
                            <select
                              required
                              value={blockForm.reason}
                              onChange={e => setBlockForm(p => ({ ...p, reason: e.target.value }))}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-red-400 text-primary font-medium"
                            >
                              <option>Maintenance</option>
                              <option>Service</option>
                              <option>Accident Repair</option>
                              <option>Personal Use</option>
                              <option>Other</option>
                            </select>
                          </div>
                          <div className="flex flex-col justify-end">
                            <button
                              type="submit"
                              className="w-full py-2 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                            >
                              <Ban className="h-3.5 w-3.5" />
                              <span>Block Dates</span>
                            </button>
                          </div>
                          {/* Notes — full width */}
                          <div className="sm:col-span-2 lg:col-span-4">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Internal Notes (Optional)</label>
                            <input
                              type="text"
                              value={blockForm.notes}
                              onChange={e => setBlockForm(p => ({ ...p, notes: e.target.value }))}
                              placeholder="E.g. Scheduled service at Maruti Suzuki workshop"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-accent text-primary font-medium"
                            />
                          </div>
                        </form>
                      </div>

                      {/* Active Blocks List */}
                      {availBlocks.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
                          <h3 className="text-sm font-bold text-primary mb-4">Active Blocked Periods</h3>
                          <div className="space-y-3">
                            {availBlocks.map(block => (
                              <div key={block.id} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                <div>
                                  <p className="text-xs font-bold text-red-900">{block.startDate} → {block.endDate}</p>
                                  <p className="text-[10px] text-red-700 mt-0.5">{block.reason}{block.notes ? ` — ${block.notes}` : ""}</p>
                                </div>
                                <button
                                  onClick={async () => {
                                    await deleteBlockedPeriod(block.id);
                                    const [map, newBlocks] = await Promise.all([
                                      buildDateStatusMap(availCar.id, 30),
                                      getBlockedPeriodsForCar(availCar.id),
                                    ]);
                                    setAvailDateMap(map);
                                    setAvailBlocks(newBlocks);
                                    setBlockSuccess("Block removed successfully.");
                                  }}
                                  className="ml-4 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[10px] uppercase tracking-wider cursor-pointer transition"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Upcoming Bookings */}
                      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
                        <h3 className="text-sm font-bold text-primary mb-4">Booking History — {availCar.name}</h3>
                        {availBookings.length === 0 ? (
                          <p className="text-gray-400 text-xs">No bookings found for this vehicle.</p>
                        ) : (
                          <div className="space-y-3">
                            {availBookings.slice(0, 10).map(b => {
                              const statusColors = {
                                Pending: "bg-yellow-100 text-yellow-800",
                                Confirmed: "bg-blue-100 text-blue-800",
                                Active: "bg-purple-100 text-purple-800",
                                Completed: "bg-gray-100 text-gray-600",
                                Cancelled: "bg-red-100 text-red-700",
                                "Over Time": "bg-orange-100 text-orange-800",
                              };
                              return (
                                <div key={b.id} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 bg-gray-50/60">
                                  <div>
                                    <p className="text-xs font-bold text-primary">{b.customerName || "Unknown"}</p>
                                    <p className="text-[10px] text-gray-500">{b.departureDate} at {b.departureTime} · {b.days} day(s)</p>
                                    <p className="text-[10px] text-gray-400">{b.customerPhone}</p>
                                  </div>
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusColors[b.status] || "bg-gray-100 text-gray-600"}`}>
                                    {b.status}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* 1. OVERTIME / EXTRA CHARGES MODAL */}
      <AnimatePresence>
        {showOvertimeModal && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md p-8 border border-gray-100 shadow-2xl relative text-left"
            >
              <button 
                onClick={() => setShowOvertimeModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-lg font-bold text-primary mb-2">Overtime Management</h3>
              <p className="text-xs text-gray-400 mb-6">Booking: {selectedBooking.id} ({selectedBooking.customerName})</p>

              <form onSubmit={handleSaveOvertime} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Extra Hours</label>
                    <input 
                      type="number" 
                      value={overtimeForm.extraHours}
                      onChange={(e) => setOvertimeForm(prev => ({ ...prev, extraHours: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-accent text-primary font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Extra KM</label>
                    <input 
                      type="number" 
                      value={overtimeForm.extraKm}
                      onChange={(e) => setOvertimeForm(prev => ({ ...prev, extraKm: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-accent text-primary font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Late Charges (₹)</label>
                    <input 
                      type="number" 
                      value={overtimeForm.lateCharges}
                      onChange={(e) => setOvertimeForm(prev => ({ ...prev, lateCharges: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-accent text-primary font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Penalty Amount (₹)</label>
                    <input 
                      type="number" 
                      value={overtimeForm.penaltyAmount}
                      onChange={(e) => setOvertimeForm(prev => ({ ...prev, penaltyAmount: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-accent text-primary font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Additional Charges (₹)</label>
                  <input 
                    type="number" 
                    value={overtimeForm.additionalCharges}
                    onChange={(e) => setOvertimeForm(prev => ({ ...prev, additionalCharges: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-accent text-primary font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Remarks / Reason</label>
                  <textarea 
                    value={overtimeForm.remarks}
                    onChange={(e) => setOvertimeForm(prev => ({ ...prev, remarks: e.target.value }))}
                    rows="2"
                    placeholder="Describe late return or damage notes"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-accent text-primary font-medium resize-none"
                  ></textarea>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3 bg-accent hover:bg-amber-500 text-primary font-bold rounded-xl text-xs uppercase tracking-wider transition-transform hover:scale-102 cursor-pointer shadow-md"
                  >
                    Save Changes & Alert Customer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. ADD / EDIT CAR FLEET MODAL */}
      <AnimatePresence>
        {showCarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-lg p-8 border border-gray-100 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowCarModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-lg font-bold text-primary mb-6">{editingCar ? "Modify Car" : "Add New Car"}</h3>

              <form onSubmit={handleCarSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Car Name</label>
                  <input 
                    type="text" 
                    required
                    value={carForm.name}
                    onChange={(e) => setCarForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="E.g. Innova Crysta 2024"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-accent text-primary font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Daily Rental (₹)</label>
                    <input 
                      type="number" 
                      required
                      value={carForm.price}
                      onChange={(e) => setCarForm(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-accent text-primary font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Seats</label>
                    <input 
                      type="number" 
                      required
                      value={carForm.seats}
                      onChange={(e) => setCarForm(prev => ({ ...prev, seats: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-accent text-primary font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Fuel Type</label>
                    <select 
                      value={carForm.fuel}
                      onChange={(e) => setCarForm(prev => ({ ...prev, fuel: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-accent text-primary font-medium cursor-pointer"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Transmission</label>
                    <select 
                      value={carForm.transmission}
                      onChange={(e) => setCarForm(prev => ({ ...prev, transmission: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-accent text-primary font-medium cursor-pointer"
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Car Images (URLs)</label>
                    <span className="text-[10px] text-accent font-bold">1 Required · Max 4</span>
                  </div>
                  <div className="space-y-2">
                    {carForm.galleryUrls.map((url, idx) => (
                      <div key={idx} className="relative">
                        <input
                          type="text"
                          required={idx === 0}
                          value={url}
                          onChange={(e) => {
                            const updated = [...carForm.galleryUrls];
                            updated[idx] = e.target.value;
                            setCarForm(prev => ({ ...prev, galleryUrls: updated }));
                          }}
                          placeholder={idx === 0 ? "Image 1 URL (required)" : `Image ${idx + 1} URL (optional)`}
                          className={`w-full bg-gray-50 border rounded-xl py-2.5 pl-8 pr-4 text-xs focus:outline-none focus:border-accent text-primary font-medium transition-all ${
                            idx === 0 ? "border-accent/50" : "border-gray-200"
                          }`}
                        />
                        <span className={`absolute left-3 top-3 text-[10px] font-black ${
                          idx === 0 ? "text-accent" : "text-gray-300"
                        }`}>{idx + 1}</span>
                      </div>
                    ))}
                  </div>
                  {/* Live preview of image 1 */}
                  {carForm.galleryUrls[0] && (
                    <div className="mt-3 rounded-xl overflow-hidden h-28 border border-gray-100 bg-gray-50">
                      <img
                        src={carForm.galleryUrls[0]}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea 
                    value={carForm.desc}
                    onChange={(e) => setCarForm(prev => ({ ...prev, desc: e.target.value }))}
                    rows="2"
                    placeholder="Short marketing writeup"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-accent text-primary font-medium resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Specifications (Comma Separated)</label>
                  <input 
                    type="text" 
                    value={carForm.specs}
                    onChange={(e) => setCarForm(prev => ({ ...prev, specs: e.target.value }))}
                    placeholder="E.g. Sunroof, Touch Screen, 300 KM limit"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-accent text-primary font-medium"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="available"
                    checked={carForm.available}
                    onChange={(e) => setCarForm(prev => ({ ...prev, available: e.target.checked }))}
                    className="h-4 w-4 rounded accent-accent cursor-pointer"
                  />
                  <label htmlFor="available" className="text-xs text-gray-600 font-bold cursor-pointer">Available for Booking</label>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-primary text-accent hover:bg-black font-bold rounded-xl text-xs uppercase tracking-wider transition-transform hover:scale-102 cursor-pointer shadow-md"
                  >
                    {editingCar ? "Save Car Changes" : "Add Car"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. LIGHTBOX DL / AADHAAR MODAL */}
      <AnimatePresence>
        {showDocModal && selectedDocs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-4xl p-6 sm:p-8 border border-gray-100 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowDocModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header Details */}
              <div className="border-b pb-4 mb-6">
                <h3 className="text-xl font-extrabold text-primary">Document Verification</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase block">Customer Name</span>
                    <span className="font-bold text-primary">{selectedDocs.name}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase block">Phone</span>
                    <span className="font-bold text-primary">{selectedDocs.phone}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase block">Car</span>
                    <span className="font-bold text-primary">{selectedDocs.carName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase block">Care Of</span>
                    <span className="font-bold text-primary">{selectedDocs.careOf}</span>
                  </div>
                </div>
              </div>

              {/* Documents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="block text-xs font-extrabold text-primary uppercase tracking-wider mb-2.5">Driving Licence (DL)</span>
                  {renderAdminDocViewer(selectedDocs.dlUrl, "Driving Licence")}
                </div>

                <div>
                  <span className="block text-xs font-extrabold text-primary uppercase tracking-wider mb-2.5">Aadhaar Card</span>
                  {renderAdminDocViewer(selectedDocs.aadhaarUrl, "Aadhaar Card")}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmCar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-sm p-6 border border-gray-100 shadow-2xl relative text-center"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Trash2 className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Delete Car?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to remove <span className="font-bold text-primary">{deleteConfirmCar.name}</span> from your fleet? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirmCar(null)}
                  className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDeleteCar}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors cursor-pointer shadow-md shadow-red-500/20"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
