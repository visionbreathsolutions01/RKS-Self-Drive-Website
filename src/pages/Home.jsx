// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCars } from "../services/db";
import {
  DollarSign, Wrench, Shield, CheckCircle, Headphones, Star,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Car, ArrowRight, Eye
} from "lucide-react";
import { getCurrentSessionUser, saveCar } from "../services/db";
import CarGalleryModal from "../components/CarGalleryModal";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [activeFaq, setActiveFaq] = useState(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const navigate = useNavigate();
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const currentUser = getCurrentSessionUser();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const list = await getCars();
        // Show first 6 cars as featured
        setFeaturedCars(list.slice(0, 6));
      } catch (err) {
        console.error(err);
      }
    };
    fetchCars();
  }, []);

  const whyChooseUsData = [
    {
      title: "Affordable Pricing",
      desc: "Get the best self-drive rental rates in Hyderabad with zero hidden charges and flexible payment terms.",
      icon: DollarSign
    },
    {
      title: "Well Maintained Cars",
      desc: "Our vehicles undergo strict inspections and regular servicing to ensure absolute safety and top hygiene.",
      icon: Wrench
    },
    {
      title: "Premium Vehicles",
      desc: "Choose from an extensive, premium fleet of modern SUVs, comfortable hatchbacks, and spacious MPVs.",
      icon: Car
    },
    {
      title: "Easy Booking",
      desc: "Quick, hassle-free online booking system. Just upload your DL, Aadhaar, pay the security deposit and drive.",
      icon: CheckCircle
    },
    {
      title: "24×7 Support",
      desc: "Enjoy complete peace of mind on the highway with our round-the-clock emergency road assistance support.",
      icon: Headphones
    },
    {
      title: "Trusted Service",
      desc: "Over thousands of happy customers count on Sai & the team at RKS for reliability, safety, and transparency.",
      icon: Shield
    }
  ];

  const testimonials = [
    {
      name: "Abhinay Reddy",
      rating: 5,
      review: "Super clean car, excellent customer service by Sai. The Thar Roxx was brand new and drove like a dream. Highly recommend RKS Self Drive Cars!",
      location: "Madhapur, Hyd"
    },
    {
      name: "Divya Teja",
      rating: 5,
      review: "Rented an Ertiga VXI for a family weekend trip. The vehicle was perfectly maintained. Transparent documentation and direct pricing. Will book again!",
      location: "Gachibowli, Hyd"
    },
    {
      name: "Sandeep Kumar",
      rating: 5,
      review: "Sai makes the booking process very easy. The Kia Seltos Automatic was in pristine condition. Best car rental company in Hyderabad by far.",
      location: "Secunderabad"
    }
  ];

  const faqs = [
    {
      q: "What documents are required to rent a car?",
      a: "You need a valid Original Driving Licence (DL) and an Aadhaar Card. The name on both documents must match the booking customer."
    },
    {
      q: "Is there a speed limit for the rental cars?",
      a: "Yes, there is a speed limit of 120 KM/H for highway safety. Violating the limit triggers automatic penalties."
    },
    {
      q: "What is the security deposit amount?",
      a: "A minor refundable security deposit is collected before vehicle delivery. This is returned within 24 hours of car inspection upon safe return."
    },
    {
      q: "What is the daily distance (KM) limit?",
      a: "Our standard rental includes a 300 KM limit per 24 hours. Extra KM charges apply based on the car model."
    },
    {
      q: "Can I cancel my booking? What is the policy?",
      a: "Yes, bookings can be cancelled. Cancellations done 24 hours before the departure time are fully refundable. Late cancellations attract minimal fees."
    },
    {
      q: "Are fuel charges included in the daily rental?",
      a: "No, fuel charges are not included. The vehicle is provided with fuel, and the customer must return it at the same fuel level, or pay actual fuel charges."
    }
  ];

  const nextReview = () => {
    setReviewIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevReview = () => {
    setReviewIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Autoplay Testimonial Slider
  useEffect(() => {
    const interval = setInterval(nextReview, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-bg-light min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative h-[85vh] flex items-center justify-center bg-black overflow-hidden">
        {/* Hero Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60 transition-scale duration-[10000ms] hover:scale-105"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80')" 
          }}
        />
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-black/40 to-black/80" />

        {/* Hero Content */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest mb-6">
              Premium Self Drive Experience
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
              Drive Your Journey with <span className="text-accent text-stroke-accent">Freedom</span>
            </h1>
            <p className="text-lg sm:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
              Premium Self Drive Cars at Affordable Prices. Explore Hyderabad on your own terms.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <Link 
              to="/cars" 
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent hover:bg-amber-500 text-primary font-extrabold text-base tracking-wide shadow-xl shadow-accent/25 transition-all hover:scale-105"
            >
               Book Now
            </Link>
            <Link 
              to="/about" 
              className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-extrabold text-base tracking-wide backdrop-blur-sm transition-all hover:border-white/40"
            >
               About Us
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. WHY CHOOSE US */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-primary mb-4">
            Why Choose <span className="text-accent">RKS Self Drives</span>?
          </h2>
          <div className="h-1 bg-accent w-24 mx-auto mb-6 rounded-full" />
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto font-light">
            We deliver visual elegance, top-tier automotive maintenance, and flexible travel policies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {whyChooseUsData.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="premium-card bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-start"
            >
              <div className="h-12 w-12 rounded-xl bg-accent/15 flex items-center justify-center text-accent mb-6 shadow-inner">
                <item.icon className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-3">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED FLEET */}
      <section className="py-24 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <h2 className="text-3xl sm:text-5xl font-extrabold mb-4 text-white">
                Featured <span className="text-accent">Cars</span>
              </h2>
              <p className="text-gray-400 text-sm sm:text-base font-light max-w-lg">
                Explore our selection of highly booked luxury vehicles. Pristine inside and out.
              </p>
            </div>
            <Link 
              to="/cars" 
              className="mt-6 md:mt-0 flex items-center space-x-2 text-accent font-bold text-sm tracking-wide hover:underline cursor-pointer group"
            >
              <span>Explore All 14 Vehicles</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCars.map((car, idx) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="premium-card-dark rounded-2xl overflow-hidden shadow-2xl flex flex-col group h-full relative"
              >
                {/* Image Wrap */}
                <div className="relative h-56 w-full overflow-hidden bg-white/5">
                  <img 
                    src={car.image} 
                    alt={car.name}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-primary/80 backdrop-blur-md px-3 py-1 rounded-full text-xs text-accent font-bold tracking-wider border border-accent/20">
                    {car.fuel}
                  </div>
                  <div className="absolute top-4 right-4 bg-accent text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                    {car.transmission}
                  </div>
                  {/* Eye Icon Button */}
                  <button
                    className="absolute top-4 right-12 text-gray-200 hover:text-white transition-colors"
                    onClick={() => { setSelectedCar(car); setGalleryModalOpen(true); }}
                  >
                    <Eye size={20} />
                  </button>
                </div>

                {/* Card Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors mb-2">
                    {car.name}
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed mb-6 line-clamp-2">
                    {car.desc}
                  </p>

                  <div className="flex items-end justify-between mt-auto">
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest block">Daily Rent</span>
                      <span className="text-2xl font-black text-accent">₹{car.price} <span className="text-xs font-normal text-white">/ day</span></span>
                    </div>

                    <div className="flex space-x-2">
                      <button 
                        onClick={() => navigate(`/cars?select=${car.id}`)}
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => navigate("/booking", { state: { prefilledCarId: car.id } })}
                        className="px-4 py-2 rounded-xl bg-accent hover:bg-amber-500 text-primary font-extrabold text-xs transition-colors shadow-lg shadow-accent/20 cursor-pointer"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CUSTOMER REVIEWS */}
      <section className="py-24 bg-[#0a0a0a] text-white overflow-hidden relative">
        <div className="absolute top-1/2 left-10 transform -translate-y-1/2 text-[120px] font-black text-white/[0.02] select-none pointer-events-none font-sans hidden md:block">
          REVIEWS
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="text-center mb-12">
            <span className="text-xs text-accent font-bold uppercase tracking-widest block mb-3">Happy Customers</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">What Our Drivers Say</h2>
          </div>

          <div className="h-64 sm:h-56 relative flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={reviewIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="max-w-2xl mx-auto"
              >
                <div className="flex justify-center space-x-1 mb-6 text-accent">
                  {[...Array(testimonials[reviewIndex].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent" />
                  ))}
                </div>
                <p className="text-lg sm:text-xl text-gray-300 italic font-light leading-relaxed mb-6">
                  "{testimonials[reviewIndex].review}"
                </p>
                <h4 className="text-sm font-bold tracking-wide uppercase text-white">
                  {testimonials[reviewIndex].name}
                </h4>
                <span className="text-xs text-gray-500">{testimonials[reviewIndex].location}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Dots & Arrows */}
          <div className="flex items-center justify-center space-x-6 mt-8">
            <button 
              onClick={prevReview}
              className="p-2 rounded-full border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex space-x-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setReviewIndex(idx)}
                  className={`h-2.5 w-2.5 rounded-full transition-colors cursor-pointer ${
                    idx === reviewIndex ? "bg-accent" : "bg-white/20"
                  }`}
                />
              ))}
            </div>
            <button 
              onClick={nextReview}
              className="p-2 rounded-full border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-primary mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Got queries? Find answers to the most common questions before booking.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left font-bold text-primary text-base hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="h-5 w-5 text-accent" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-50 bg-gray-50/50"
                    >
                      <div className="p-6 text-sm text-gray-500 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        </section>
        {/* Car Gallery Modal */}
        {galleryModalOpen && selectedCar && (
          <CarGalleryModal
            car={selectedCar}
            open={galleryModalOpen}
            onClose={() => setGalleryModalOpen(false)}
            isAdmin={!!currentUser?.isAdmin}
          />
        )}
      </div>
    );
}
