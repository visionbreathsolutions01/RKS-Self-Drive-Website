// src/components/Footer.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Phone, MapPin, Mail, Clock, ShieldCheck, Heart, Calendar } from "lucide-react";

export default function Footer() {
  const location = useLocation();

  if (location.pathname === "/admin") {
    return null;
  }

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "Our Cars", path: "/cars" },
    { name: "About Us", path: "/about" },
    { name: "Terms & Conditions", path: "/terms" },
    { name: "Contact Us", path: "/contact" }
  ];

  return (
    <footer className="bg-primary text-white pt-16 pb-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand Info */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <img src="/rks-logo.jpg" alt="RKS Self Drives" className="h-16 w-16 md:h-20 md:w-20 rounded-full shadow-lg border-2 border-white/10" />
              <h3 className="text-xl md:text-2xl font-extrabold tracking-wider leading-tight">
                RKS<br className="hidden lg:block"/><span className="text-accent lg:text-lg"> SELF DRIVE CARS</span>
              </h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Hyderabad's premium self-drive car rental platform since 2021. Drive your dream journey with complete freedom, transparent pricing, and unlimited comfort.
            </p>
            <div className="flex items-center space-x-3 text-gray-400 text-sm">
              <Calendar className="h-5 w-5 text-accent flex-shrink-0" />
              <span>Established: 2021 by Sai</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-400 text-sm mt-3">
              <ShieldCheck className="h-5 w-5 text-accent flex-shrink-0" />
              <span>100% Verified Fleet & Fast Approvals</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-bold uppercase tracking-widest text-accent mb-6 border-l-4 border-accent pl-3">
              Quick Links
            </h4>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-accent text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-base font-bold uppercase tracking-widest text-accent mb-6 border-l-4 border-accent pl-3">
              Contact Details
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-gray-400 text-sm">
                <MapPin className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <span>RKS Self Drive Cars, Hyderabad, Telangana, India</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400 text-sm">
                <Phone className="h-5 w-5 text-accent flex-shrink-0" />
                <div className="flex flex-col">
                  <a href="tel:+918019687186" className="hover:text-white transition-colors">+91 8019687186</a>
                  <a href="tel:+916301239187" className="hover:text-white transition-colors">+91 6301239187</a>
                </div>
              </li>
              <li className="flex items-center space-x-3 text-gray-400 text-sm">
                <Mail className="h-5 w-5 text-accent flex-shrink-0" />
                <a href="mailto:info@rksselfdrive.com" className="hover:text-white transition-colors">info@rksselfdrive.com</a>
              </li>

            </ul>
          </div>

          {/* Map Embed */}
          <div>
            <h4 className="text-base font-bold uppercase tracking-widest text-accent mb-6 border-l-4 border-accent pl-3">
              Location Map
            </h4>
            <div className="rounded-xl overflow-hidden shadow-lg border border-white/10 h-48 bg-white/5">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.8272449791444!2d78.4316933!3d17.4200424!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb90d3d526715f%3A0xe54d8f8ad7919864!2sRKS%20Self%20Drive%20Cars!5e0!3m2!1sen!2sin!4v1711200000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="RKS Self Drive Cars Location Map"
              ></iframe>
            </div>
          </div>

        </div>

        {/* Copyright Section */}
        <div className="border-t border-white/5 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between text-gray-500 text-xs">
          <p>© {new Date().getFullYear()} RKS Self Drives. All Rights Reserved.</p>
          <p className="flex items-center mt-4 sm:mt-0">
            <a href="https://visionbreathsolutions.com/" target="_blank" rel="noopener noreferrer" className="text-white">Powered by Vision Breath Solutions Pvt.Ltd</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
