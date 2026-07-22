// src/components/FloatingActions.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { CalendarRange } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingActions() {
  const [showBookNow, setShowBookNow] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setShowBookNow(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide Book Now on the booking/cars pages (user is already there)
  const isBookingPage = location.pathname === "/booking" || location.pathname === "/cars";

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-4 z-40">
      {/* Floating Book Now — shown on scroll, hidden on booking/cars pages */}
      <AnimatePresence>
        {showBookNow && !isBookingPage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Link
              to="/cars"
              className="flex items-center space-x-2 px-5 py-3 rounded-full bg-accent text-primary font-bold shadow-2xl hover:bg-amber-500 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wider border border-primary/10"
            >
              <CalendarRange className="h-4.5 w-4.5 animate-bounce" />
              <span>Book Now</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
