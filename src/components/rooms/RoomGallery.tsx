"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

interface RoomGalleryProps {
  images: string[];
  roomName: string;
}

export default function RoomGallery({ images, roomName }: RoomGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  const paginate = useCallback(
    (dir: number) => {
      setDirection(dir);
      setSelected((prev) => {
        if (dir === 1) return prev === images.length - 1 ? 0 : prev + 1;
        return prev === 0 ? images.length - 1 : prev - 1;
      });
    },
    [images.length]
  );

  const goTo = (index: number) => {
    setDirection(index > selected ? 1 : -1);
    setSelected(index);
  };

  const openLightbox = (index: number) => {
    setSelected(index);
    setLightboxOpen(true);
  };

  if (!images || images.length === 0) return null;

  return (
    <>
      {/* Main Carousel */}
      <div className="relative group">
        <div
          className="relative aspect-video rounded-xl overflow-hidden cursor-pointer bg-black/20"
          onClick={() => openLightbox(selected)}
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={selected}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0"
            >
              <Image
                src={images[selected]}
                alt={`${roomName} - Image ${selected + 1}`}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Zoom Icon */}
          <div className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-5 h-5 text-white" />
          </div>

          {/* Counter Badge */}
          <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-xs text-white font-medium">
            {selected + 1} / {images.length}
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  paginate(-1);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 hover:scale-110"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  paginate(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 hover:scale-110"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mt-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                selected === i
                  ? "border-neon-cyan ring-2 ring-neon-cyan/30"
                  : "border-transparent hover:border-white/20 opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${roomName} thumbnail ${i + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Main Image */}
            <div
              className="relative w-full h-full max-w-6xl mx-auto flex items-center justify-center p-4 md:p-12"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={`lb-${selected}`}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={images[selected]}
                    alt={`${roomName} - Full view ${selected + 1}`}
                    fill
                    className="object-contain"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Lightbox Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => paginate(-1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-110"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => paginate(1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-110"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Lightbox Thumbnails Bottom */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full px-4">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      goTo(i);
                    }}
                    className={`relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      selected === i
                        ? "border-neon-cyan"
                        : "border-white/20 opacity-50 hover:opacity-80"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${roomName} thumb ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Counter */}
            <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium">
              {selected + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
