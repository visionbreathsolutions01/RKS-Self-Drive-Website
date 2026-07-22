// src/pages/Terms.jsx
import React from "react";
import { Scale, ShieldAlert, Award, ShieldAlert as AlertIcon, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function Terms() {
  const terms = [
    {
      title: "Distance (KM) Limit",
      desc: "Every 24-hour rental period has a standard distance limit of 300 KM. Travel beyond this limit is subject to additional usage charges."
    },
    {
      title: "Extra KM Charges",
      desc: "Kilometers accumulated beyond the standard 300 KM limit are billed at standard category rates (ranging from ₹10 to ₹25 per extra KM depending on the vehicle class)."
    },
    {
      title: "Security Deposit",
      desc: "A security deposit is required for all bookings. This deposit is fully refundable within 24 hours after the car is returned and inspected."
    },
    {
      title: "Pre-Pickup Vehicle Inspection",
      desc: "Customers must perform a thorough check of the vehicle's bodywork, interior condition, fuel levels, and tire tread before signing the pickup sheet."
    },
    {
      title: "Damage Responsibility",
      desc: "The customer is liable for any bodywork damages, scratches, or interior tears incurred during the rental period up to the maximum insurance excess limit."
    },
    {
      title: "Insurance Policy Validity",
      desc: "Standard insurance protection is voided if the driver violates regional laws, operates the car under the influence of substances, or permits unlisted drivers to operate the vehicle."
    },
    {
      title: "No Smoking Policy",
      desc: "Smoking, vaping, or consuming strong-odor products inside the vehicle is strictly prohibited. Violators will face a deep-cleaning penalty of ₹3,000."
    },
    {
      title: "Speed Limit Regulation",
      desc: "A strict speed limit of 120 KM/H is enforced. Violations are monitored via GPS telemetry and carry automatic penalty fees."
    },
    {
      title: "Late Return Charges",
      desc: "Cars must be returned on or before the departure expiry time. Unapproved extensions are subject to double the hourly rate plus a flat late return fine."
    },
    {
      title: "Prohibition of Substance Abuse",
      desc: "Operating the vehicle under the influence of alcohol, drugs, or prescription medicines that impair driving is strictly illegal and will result in booking termination."
    },
    {
      title: "Advance Rental Payments",
      desc: "The complete estimated lease cost must be paid in advance before the vehicle keys are issued."
    },
    {
      title: "Cancellation & Refund Terms",
      desc: "Cancellations made 24 hours prior to scheduled departure are eligible for a full refund. Cancellations made within 24 hours attract a 1-day rental charge."
    },
    {
      title: "Cleanliness Policy",
      desc: "The vehicle should be returned in a clean and presentable state. Excessive dirt, mud, or food litter inside will attract washing charges."
    },
    {
      title: "Fuel Refill Policy",
      desc: "The car is provided with fuel. The customer must return it with the same fuel level, or pay actual refueling costs plus service fees."
    },
    {
      title: "Original Driving Licence",
      desc: "The customer must present their valid, original Driving Licence (DL) at the time of pickup. Photocopied or digital documents are subject to verification."
    },
    {
      title: "Aadhaar Card Verification",
      desc: "An original Aadhaar Card matching the details of the primary driver must be submitted alongside the Driving Licence for verification."
    },
    {
      title: "Tolls & Traffic Penalties",
      desc: "All Fastag toll payments, parking fees, and traffic violations during the lease are the customer's sole responsibility."
    },
    {
      title: "Commercial Use Prohibition",
      desc: "Vehicles are registered for private self-drive purposes only. Sub-leasing, transport of passengers for hire, or courier operations are strictly forbidden."
    },
    {
      title: "Illegal Activities Restriction",
      desc: "The vehicle must not be used for carrying contraband, towing other cars, street racing, stunt driving, or off-road mud-bashing."
    },
    {
      title: "GPS Telematics Integration",
      desc: "For safety, logistics, and anti-theft tracking, all RKS cars are fitted with active GPS telematics devices which collect speed and location data."
    },
    {
      title: "Breakdowns & Repairs",
      desc: "In case of any engine warning light or mechanical breakdown, contact RKS Customer Support immediately. Independent repairs are prohibited."
    },
    {
      title: "Right to Terminate Agreement",
      desc: "RKS Self Drive Cars reserves the right to cancel bookings or remotely terminate vehicle ignition if the customer violates safety rules or lease agreements."
    },
    {
      title: "Jurisdiction & Legal Disputes",
      desc: "All agreements, terms, and disputes arising under this self-drive contract are subject exclusively to the jurisdiction of the Hyderabad courts."
    }
  ];

  return (
    <div className="bg-bg-light min-h-screen pb-24">
      {/* Page Header */}
      <section className="bg-primary text-white py-16 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 z-10 relative">
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4">Rental Agreement</h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base font-light">
            Please read the 23 core rental terms and conditions governing the lease of RKS Self Drive cars.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Core Warning Badge */}
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl mb-12 flex items-start space-x-4 max-w-4xl mx-auto text-left">
          <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide">Important Travel Warning</h3>
            <p className="text-xs text-amber-800 leading-normal mt-1">
              Violating the speed limit (120 KM/H), driving under the influence of alcohol, or sub-leasing the car triggers immediate forfeiture of security deposits and lease termination. Always inspect your car before key pickup.
            </p>
          </div>
        </div>

        {/* 23 Terms Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {terms.map((term, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (index % 3) * 0.05 }}
              className="premium-card bg-white p-6 rounded-2xl border border-gray-200/50 shadow-sm text-left flex flex-col justify-between"
            >
              <div>
                <span className="inline-flex h-8 w-8 rounded-full bg-accent/15 text-accent text-xs font-black items-center justify-center mb-4">
                  {index + 1}
                </span>
                <h4 className="font-extrabold text-sm text-primary mb-2">{term.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{term.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
