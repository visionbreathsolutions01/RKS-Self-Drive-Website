// src/pages/About.jsx
import React from "react";
import { Shield, Target, Eye, Milestone, Trophy, Users, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="bg-bg-light min-h-screen pb-24">
      {/* Page Header */}
      <section className="relative py-24 bg-primary text-white text-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80')" 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-primary" />
        <div className="relative max-w-4xl mx-auto px-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">About Us</h1>
            <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base font-light">
              Learn about our journey, core beliefs, and our milestones since establishing in 2021.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story & Founders Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Visual Presentation */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-[420px] rounded-3xl overflow-hidden shadow-xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80" 
              alt="Sai, Founder of RKS Self Drive Cars"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <span className="text-accent font-bold text-xs uppercase tracking-widest block mb-1">Our Founder</span>
              <h3 className="text-2xl font-bold">Sai</h3>
              <p className="text-gray-300 text-xs mt-1">Established RKS Self Drive Cars in 2021</p>
            </div>
          </motion.div>

          {/* Text Description */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-xs font-bold text-accent uppercase tracking-widest block mb-3">Company History</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-primary mb-6">
              RKS Self Drive Cars
            </h2>
            <p className="text-gray-600 text-base leading-relaxed mb-6">
              RKS Self Drive Cars was established in <strong className="text-primary font-bold">2021</strong> by <strong className="text-primary font-bold">Sai</strong> with the simple yet powerful vision of providing premium self-drive vehicles at affordable prices, while maintaining complete transparency and exceptional customer support.
            </p>
            <p className="text-gray-600 text-base leading-relaxed mb-8">
              We started out with a tiny fleet in Hyderabad, operating on high principles of honesty: no hidden fees, clean interior deliveries, and responsive assistance. Today, RKS is a growing symbol of travel freedom for families and groups across the region.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <Users className="h-8 w-8 text-accent flex-shrink-0" />
                <div>
                  <span className="block text-xl font-bold text-primary">1000+</span>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Happy Trips</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <Award className="h-8 w-8 text-accent flex-shrink-0" />
                <div>
                  <span className="block text-xl font-bold text-primary">14+</span>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Premium Models</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-bg-light p-10 rounded-2xl border border-gray-200/50 relative overflow-hidden flex flex-col items-start"
            >
              <div className="h-12 w-12 rounded-xl bg-primary text-accent flex items-center justify-center mb-6">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-4">Our Mission</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Provide highly reliable, clean, affordable, and hassle-free self-drive rentals. We empower customers with freedom and comfort to enjoy every mile of their journey without restrictions.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-bg-light p-10 rounded-2xl border border-gray-200/50 relative overflow-hidden flex flex-col items-start"
            >
              <div className="h-12 w-12 rounded-xl bg-accent text-primary flex items-center justify-center mb-6">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-4">Our Vision</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Become Hyderabad's most trusted, consumer-friendly self-drive car rental company. We aim to define the benchmark of safety, service standards, and tech-driven booking ease.
              </p>
            </motion.div>
          </div>
        </div>
      </section>


    </div>
  );
}
