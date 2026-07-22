// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Component Elements
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingActions from "./components/FloatingActions";

// Page Components
import Home from "./pages/Home";
import About from "./pages/About";
import Cars from "./pages/Cars";
import Booking from "./pages/Booking";
import Auth from "./pages/Auth";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";

import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-bg-light text-primary selection:bg-accent/30">
          
          {/* Header Navigation */}
          <Navbar />

          {/* Main App Page Viewports */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/cars" element={<Cars />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<CustomerDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </main>

          {/* Floating Actions Stack */}
          <FloatingActions />

          {/* Footer branding */}
          <Footer />

        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
