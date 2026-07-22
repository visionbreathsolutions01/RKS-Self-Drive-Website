// src/pages/Cars.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCars } from "../services/db";
import { Search, SlidersHorizontal, AlertCircle, Eye, X, ChevronLeft, ChevronRight, Images } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
const { user } = useAuth();
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFuel, setSelectedFuel] = useState("All");
  const [selectedTrans, setSelectedTrans] = useState("All");
  const [maxPrice, setMaxPrice] = useState(6000);

  // Gallery Lightbox State
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryCarName, setGalleryCarName] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Load cars from db
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const list = await getCars();
        setCars(list);
        setFilteredCars(list);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCars();
  }, []);

  // Read location state for prefilled search filters
  useEffect(() => {
    if (location.state && location.state.prefilledFuel) {
      setSelectedFuel(location.state.prefilledFuel);
    }
  }, [location]);

  // Filter Logic
  useEffect(() => {
    let result = cars;

    if (searchQuery.trim()) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.desc.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFuel !== "All") {
      result = result.filter(c => c.fuel === selectedFuel);
    }

    if (selectedTrans !== "All") {
      result = result.filter(c => c.transmission === selectedTrans);
    }

    result = result.filter(c => c.price <= maxPrice);

    setFilteredCars(result);
  }, [searchQuery, selectedFuel, selectedTrans, maxPrice, cars]);

  // Reset Filters
  const handleReset = () => {
    setSearchQuery("");
    setSelectedFuel("All");
    setSelectedTrans("All");
    setMaxPrice(6000);
  };

  const handleBookCar = (carId) => {
    navigate("/booking", { state: { prefilledCarId: carId } });
  };

  // Open gallery lightbox
  const handleViewImages = (car) => {
    const images = car.gallery && car.gallery.length > 0 ? car.gallery : [car.image];
    setGalleryImages(images.filter(Boolean));
    setGalleryIndex(0);
    setGalleryCarName(car.name);
    setGalleryOpen(true);
  };

  const handleGalleryPrev = () => {
    setGalleryIndex(i => (i - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleGalleryNext = () => {
    setGalleryIndex(i => (i + 1) % galleryImages.length);
  };

  // Keyboard navigation for gallery
  useEffect(() => {
    if (!galleryOpen) return;
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") handleGalleryPrev();
      if (e.key === "ArrowRight") handleGalleryNext();
      if (e.key === "Escape") setGalleryOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [galleryOpen, galleryImages.length]);

  return (
    <div className="bg-bg-light min-h-screen pb-24">
      {/* Page Header */}
      <section className="bg-primary text-white py-16 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 z-10 relative">
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4">Our Car Fleet</h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base font-light">
            Choose from Hyderabad's premium collection of hatchbacks, family MPVs, and rugged offroad SUVs.
          </p>
        </div>
      </section>

      {/* Main Grid View */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* 1. FILTER SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm sticky top-28">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <span className="flex items-center space-x-2 text-primary font-extrabold text-base">
                  <SlidersHorizontal className="h-4 w-4 text-accent" />
                  <span>Filters</span>
                </span>
                <button 
                  onClick={handleReset}
                  className="text-xs font-semibold text-accent hover:underline cursor-pointer"
                >
                  Reset All
                </button>
              </div>

              {/* Search Query */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Search Car</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="E.g. Thar, Ertiga..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-primary font-medium"
                  />
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Transmission Type */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Transmission</label>
                <select 
                  value={selectedTrans}
                  onChange={(e) => setSelectedTrans(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-accent text-primary font-medium cursor-pointer"
                >
                  <option value="All">All Transmissions</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                </select>
              </div>

              {/* Fuel Type */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Fuel Type</label>
                <select 
                  value={selectedFuel}
                  onChange={(e) => setSelectedFuel(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-accent text-primary font-medium cursor-pointer"
                >
                  <option value="All">All Fuels</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Max Rent / Day</label>
                  <span className="text-xs font-bold text-accent">₹{maxPrice}</span>
                </div>
                <input 
                  type="range" 
                  min="2000" 
                  max="6000" 
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-bold uppercase">
                  <span>Min: ₹2000</span>
                  <span>Max: ₹6000</span>
                </div>
              </div>

            </div>
          </div>

          {/* 2. FLEET GRID */}
          <div className="lg:col-span-3">
            {filteredCars.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                <AlertCircle className="h-12 w-12 text-accent mb-4 animate-bounce" />
                <h3 className="text-xl font-bold text-primary mb-2">No Vehicles Matched</h3>
                <p className="text-gray-500 text-sm max-w-sm">
                  We couldn't find any vehicles matching your current selection. Try resetting filters.
                </p>
                <button 
                  onClick={handleReset}
                  className="mt-6 px-6 py-2.5 rounded-full bg-accent text-primary font-bold text-xs uppercase tracking-wider transition-transform hover:scale-105 cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCars.map((car) => {
                  const carImages = car.gallery && car.gallery.length > 0 ? car.gallery : [car.image];
                  const imageCount = carImages.filter(Boolean).length;
                  return (
                    <motion.div
                      key={car.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="premium-card bg-white rounded-2xl overflow-hidden border border-gray-200/50 shadow-sm flex flex-col group h-full"
                    >
                      {/* Visual Section */}
                      <div className="relative h-48 bg-gray-50 overflow-hidden">
                        <img 
                          src={car.image} 
                          alt={car.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-primary/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] text-accent font-bold border border-accent/20 tracking-wider">
                          {car.fuel}
                        </div>
                        <div className="absolute top-3 right-3 bg-accent text-primary px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                          {car.transmission}
                        </div>

                        {/* Eye / View Images Button */}
                        <button
                          onClick={() => handleViewImages(car)}
                          className="absolute bottom-3 right-3 flex items-center space-x-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 cursor-pointer shadow-lg"
                          title="View Photos"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>{imageCount} Photo{imageCount !== 1 ? "s" : ""}</span>
                        </button>
                      </div>

                      {/* Content Body */}
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="text-base font-bold text-primary group-hover:text-accent transition-colors mb-2">
                          {car.name}
                        </h3>
                        <p className="text-gray-500 text-xs leading-relaxed mb-6 line-clamp-2">
                          {car.desc}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                          <div>
                            <span className="text-gray-400 text-[9px] uppercase tracking-wider block font-bold">Daily Price</span>
                            <span className="text-xl font-black text-primary">₹{car.price} <span className="text-[10px] font-normal text-gray-500">/ day</span></span>
                          </div>

{(!user || user.role !== "admin") && (
  <button
    onClick={() => handleBookCar(car.id)}
    className="px-4 py-2.5 rounded-xl bg-accent hover:bg-amber-500 text-primary font-bold text-xs uppercase tracking-wider shadow-lg shadow-accent/15 transition-transform hover:scale-105 cursor-pointer"
  >
    Book Now
  </button>
)}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════
          IMAGE GALLERY LIGHTBOX MODAL
      ═══════════════════════════════════════ */}
      <AnimatePresence>
        {galleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4"
            onClick={() => setGalleryOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center space-x-2">
                  <Images className="h-4 w-4 text-accent" />
                  <span className="text-white font-bold text-sm">{galleryCarName}</span>
                  <span className="text-gray-400 text-xs">
                    {galleryIndex + 1} / {galleryImages.length}
                  </span>
                </div>
                <button
                  onClick={() => setGalleryOpen(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Main Image */}
              <div className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-2xl" style={{ aspectRatio: "16/9" }}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={galleryIndex}
                    src={galleryImages[galleryIndex]}
                    alt={`${galleryCarName} photo ${galleryIndex + 1}`}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2 }}
                  />
                </AnimatePresence>

                {/* Prev / Next Arrows */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={handleGalleryPrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors cursor-pointer shadow-lg"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleGalleryNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors cursor-pointer shadow-lg"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Dot Indicators */}
              {galleryImages.length > 1 && (
                <div className="flex justify-center space-x-2 mt-4">
                  {galleryImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setGalleryIndex(i)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        i === galleryIndex ? "w-6 bg-accent" : "w-2 bg-white/30 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Thumbnail Strip */}
              {galleryImages.length > 1 && (
                <div className="flex space-x-2 mt-4 justify-center">
                  {galleryImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setGalleryIndex(i)}
                      className={`h-16 w-24 rounded-xl overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${
                        i === galleryIndex ? "border-accent shadow-lg shadow-accent/30" : "border-transparent opacity-50 hover:opacity-80"
                      }`}
                    >
                      <img src={img} alt={`Thumb ${i + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
