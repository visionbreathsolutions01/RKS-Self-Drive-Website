// src/pages/Contact.jsx
import React, { useState } from "react";
import { Phone, MessageCircle, MapPin, Mail, Clock, Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { saveContactMessage } from "../services/db";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    
    // Save to local database
    await saveContactMessage(formData);

    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", phone: "", message: "" });
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="bg-bg-light min-h-screen pb-24">
      {/* Page Header */}
      <section className="bg-primary text-white py-16 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 z-10 relative">
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4">Contact Us</h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base font-light">
            Have questions about booking availability or custom pricing packages? Reach out to Sai and our Hyderabad team.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* 1. CONTACT CARDS COLUMN */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-lg font-bold text-primary mb-2">Get In Touch Directly</h3>
            
            {/* Phone Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/50 shadow-sm flex items-start space-x-4">
              <div className="h-10 w-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent flex-shrink-0">
                <Phone className="h-5 w-5" />
              </div>
              <div className="text-left flex-grow">
                <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Call Numbers</span>
                <a href="tel:+918019687186" className="text-sm font-bold text-primary hover:text-accent block transition-colors">+91 8019687186</a>
                <a href="tel:+916301239187" className="text-sm font-bold text-primary hover:text-accent block mt-0.5 transition-colors">+91 6301239187</a>
                
                <div className="flex space-x-2 mt-3">
                  <a 
                    href="tel:+918019687186"
                    className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-black text-white font-bold text-[10px] uppercase tracking-wider transition-transform hover:scale-105"
                  >
                    Call Sai
                  </a>
                  <a 
                    href="tel:+916301239187"
                    className="px-3.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-[10px] uppercase tracking-wider transition-transform hover:scale-105"
                  >
                    Call Office
                  </a>
                </div>
              </div>
            </div>

            {/* WhatsApp Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/50 shadow-sm flex items-start space-x-4">
              <div className="h-10 w-10 rounded-xl bg-[#25D366]/15 flex items-center justify-center text-[#25D366] flex-shrink-0">
                <MessageCircle className="h-5 w-5 fill-[#25D366]" />
              </div>
              <div className="text-left flex-grow">
                <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">WhatsApp Chat</span>
                <p className="text-xs text-gray-500 mb-3">Ping us on WhatsApp for quick bookings & availability verification.</p>
                <a 
                  href="https://wa.me/918019687186?text=Hello%20RKS%20Self%20Drive%20Cars,%20I'd%20like%20to%20rent%20a%20car."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-green-600 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center space-x-1.5 transition-transform hover:scale-105 shadow-md shadow-green-500/10"
                >
                  <MessageCircle className="h-4 w-4 fill-white" />
                  <span>Chat With Us</span>
                </a>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/50 shadow-sm flex items-start space-x-4">
              <div className="h-10 w-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent flex-shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Address Details</span>
                <p className="text-xs text-gray-600 leading-relaxed font-bold">RKS Self Drive Cars</p>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">Hyderabad, Telangana, India</p>
                <a 
                  href="https://maps.app.goo.gl/5QsYqtx1K7iFGzsP8?g_st=ic" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 mt-3 px-4 py-2 rounded-xl bg-accent hover:bg-amber-500 text-primary font-bold text-xs uppercase tracking-wider shadow-md shadow-accent/20 transition-all hover:scale-105 active:scale-95"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>
          </div>

          {/* 2. CONTACT MESSAGE FORM COLUMN */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-3xl border border-gray-200/60 shadow-sm relative">
              <h3 className="text-lg font-bold text-primary mb-6 text-left">Send Us A Message</h3>
              
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="py-12 text-center flex flex-col items-center justify-center"
                  >
                    <CheckCircle2 className="h-12 w-12 text-green-500 mb-4 animate-bounce" />
                    <h4 className="text-lg font-bold text-primary mb-2">Message Sent Successfully</h4>
                    <p className="text-gray-500 text-xs max-w-xs leading-normal">
                      Thank you for contacting RKS. Our executive support team will review your queries shortly.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    onSubmit={handleFormSubmit} 
                    className="space-y-5 text-left"
                  >
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Your Name *</label>
                      <input 
                        type="text" 
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your name"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-accent text-primary font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number *</label>
                      <input 
                        type="tel" 
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-accent text-primary font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Your Message</label>
                      <textarea 
                        name="message"
                        rows="4"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Describe your queries or specific car model requests..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-accent text-primary font-medium resize-none"
                      ></textarea>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3.5 bg-accent hover:bg-amber-500 text-primary font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-transform hover:scale-101 cursor-pointer shadow-lg shadow-accent/15"
                      >
                        <Send className="h-4 w-4" />
                        <span>Send Message</span>
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>

        {/* 3. FULL WIDTH GOOGLE MAP EMBED */}
        <div className="mt-16 bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200/50 p-4 h-[400px]">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.8272449791444!2d78.4316933!3d17.4200424!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb90d3d526715f%3A0xe54d8f8ad7919864!2sRKS%20Self%20Drive%20Cars!5e0!3m2!1sen!2sin!4v1711200000000!5m2!1sen!2sin"
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Maps Location of RKS Self Drive Cars office"
            className="rounded-2xl"
          ></iframe>
        </div>

      </div>
    </div>
  );
}
