// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";

  // Scroll detection for dynamic glassmorphism styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on page change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleLogoutClick = async () => {
    await logout();
    navigate("/");
  };



  // Regular customer nav links — hidden for admin
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Our Cars", path: "/cars" },
    { name: "About Us", path: "/about" },
    { name: "Terms & Conditions", path: "/terms" },
    { name: "Contact", path: "/contact" }
  ];

  return (
    <nav
      className={`relative sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-primary/95 backdrop-blur-md border-b border-white/10 shadow-lg py-3"
          : "bg-primary py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[4rem]">
          {/* Logo */}
          <Link to={isAdmin ? "/admin" : "/"} className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <img src="/rks-logo.jpg" alt="RKS Self Drives" className="h-12 w-12 sm:h-16 sm:w-16 md:h-[72px] md:w-[72px] rounded-full shadow-xl border-2 border-white/20 object-cover shrink-0" />
            <span className="text-sm sm:text-xl md:text-2xl font-extrabold tracking-wider text-white leading-tight">
              RKS<br className="hidden lg:block"/><span className="text-accent lg:text-lg"> SELF DRIVE CARS</span>
            </span>
          </Link>

          {/* Desktop Navigation Links — hidden for admin */}
          {!isAdmin && (
            <div className="hidden md:flex space-x-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-medium tracking-wide transition-colors relative pb-1 ${
                      isActive ? "text-accent" : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* User Menu & Mobile Trigger */}
          <div className="flex items-center space-x-3">

            {/* Desktop Auth Buttons */}
            <div className="hidden sm:flex items-center space-x-3">
              {user ? (
                <>
                  {/* Admin: only Dashboard button */}
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-accent hover:bg-amber-500 text-primary font-bold text-sm tracking-wide shadow-lg shadow-accent/20 transition-all hover:scale-105 active:scale-95"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-1 px-4 py-2 rounded-full border border-accent/20 bg-accent/10 hover:bg-accent/20 text-accent text-sm font-semibold tracking-wide transition-all"
                    >
                      <User className="h-4 w-4" />
                      <span>My Dashboard</span>
                    </Link>
                  )}

                  {/* Logout */}
                  <button
                    onClick={handleLogoutClick}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full border border-white/15 text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-semibold">Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="px-5 py-2.5 rounded-full bg-accent hover:bg-amber-500 text-primary font-bold text-sm tracking-wide shadow-lg shadow-accent/20 transition-all hover:scale-105 active:scale-95"
                >
                  Login / Register
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex sm:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 focus:outline-none transition-colors"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="sm:hidden absolute top-full left-0 right-0 border-t border-white/10 bg-primary/97 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden z-50"
          >
            <div className="px-4 pt-3 pb-5 space-y-1">

              {/* Nav links — hidden for admin */}
              {!isAdmin && navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-3 py-2.5 rounded-lg text-base font-semibold transition-colors ${
                      isActive
                        ? "bg-accent/15 text-accent"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}

              {/* User mobile actions */}
              <div className="pt-4 pb-1 border-t border-white/5 mt-3">
                {user ? (
                  <div className="space-y-2 px-1">
                    <div className="text-xs text-gray-500 font-semibold px-2 mb-1">
                      Logged in as {user.name}
                    </div>
                    <Link
                      to={isAdmin ? "/admin" : "/dashboard"}
                      className="flex items-center space-x-2 w-full px-4 py-2.5 rounded-lg bg-accent text-primary font-bold justify-center transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>{isAdmin ? "Dashboard" : "My Dashboard"}</span>
                    </Link>
                    <button
                      onClick={handleLogoutClick}
                      className="flex items-center space-x-2 w-full px-4 py-2.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-bold justify-center transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="px-1">
                    <Link
                      to="/auth"
                      className="block w-full text-center px-4 py-3 rounded-lg bg-accent hover:bg-amber-500 text-primary font-bold text-base shadow-lg transition-all"
                    >
                      Login / Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
