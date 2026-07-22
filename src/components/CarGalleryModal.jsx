// src/components/CarGalleryModal.jsx
import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload } from "lucide-react";
import { saveCar } from "../services/db";

/**
 * Modal to display a car's image gallery and allow admin uploads.
 * Props:
 *  - car: the car object (contains image, gallery array)
 *  - open: boolean to control visibility
 *  - onClose: function to close the modal
 *  - isAdmin: boolean indicating if current user is admin
 */
export default function CarGalleryModal({ car, open, onClose, isAdmin }) {
  const fileInputRef = useRef(null);
  const [gallery, setGallery] = useState(car.gallery || []);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files) => {
    if (!files.length) return;
    setUploading(true);
    const newImages = [];
    for (const file of files) {
      // Read as Data URL (base64) for local storage fallback
      const dataUrl = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.onerror = (e) => rej(e);
        reader.readAsDataURL(file);
      });
      newImages.push(dataUrl);
    }
    const updatedGallery = [...gallery, ...newImages];
    setGallery(updatedGallery);
    // Persist via saveCar (updates entire car object)
    const updatedCar = { ...car, gallery: updatedGallery };
    await saveCar(updatedCar);
    setUploading(false);
  };

  const onFileChange = (e) => {
    handleFiles(Array.from(e.target.files));
    e.target.value = null; // reset
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto relative p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={onClose}
            >
              <X size={24} />
            </button>

            {/* Main Image */}
            <div className="mb-4">
              <img
                src={car.image}
                alt={car.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {gallery.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`${car.name} gallery ${idx}`}
                  className="w-full h-32 object-cover rounded"
                />
              ))}
            </div>

            {/* Admin Upload */}
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={onFileChange}
                />
                <button
                  type="button"
                  disabled={uploading}
                  className="flex items-center px-4 py-2 bg-accent text-primary rounded hover:bg-amber-500 transition"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <Upload size={16} className="mr-2" />
                  {uploading ? "Uploading..." : "Add Images"}
                </button>
                <span className="text-sm text-gray-600">({gallery.length} images)</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
