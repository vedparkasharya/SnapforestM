"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  RotateCcw,
  Grid3x3,
  Maximize2,
  Eye,
} from "lucide-react";

interface RoomGalleryProps {
  images: string[];
  roomName: string;
}

export default function RoomGallery({ images, roomName }: RoomGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [direction, setDirection] = useState(0);
  const [viewMode, setViewMode] = useState<"carousel" | "grid" | "360">("carousel");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const is360Image = (img: string) =>
    img.includes("360") || img.includes("panoramic") || img.includes("wide-2");

  const panoramicImages = images.filter(is360Image);
  const regularImages = images.filter((img) => !is360Image);
  const has360View = panoramicImages.length > 0;

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "ArrowLeft") paginate(-1);
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, paginate]);

  // 360 panorama drag
  const handlePanoramaMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
    setDragOffset(0);
  };

  const handlePanoramaMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setDragOffset(e.clientX - dragStart);
  };

  const handlePanoramaMouseUp = () => {
    if (Math.abs(dragOffset) > 50) {
      if (dragOffset > 0) {
        paginate(-1);
      } else {
        paginate(1);
      }
    }
    setIsDragging(false);
    setDragOffset(0);
  };

  if (!images || images.length === 0) return null;

  return (
    <>
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Gallery
          </span>
          <span className="text-xs text-muted-foreground">
            ({selected + 1}/{images.length})
          </span>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setViewMode("carousel")}
            className={`p-1.5 rounded-md text-xs transition-all ${
              viewMode === "carousel"
                ? "bg-neon-cyan/20 text-neon-cyan"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Carousel View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md text-xs transition-all ${
              viewMode === "grid"
                ? "bg-neon-cyan/20 text-neon-cyan"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Grid View"
          >
            <Grid3x3 className="w-3.5 h-3.5" />
          </button>
          {has360View && (
            <button
              onClick={() => {
                setViewMode("360");
                // Select first 360 image
                const first360 = images.findIndex(is360Image);
                if (first360 >= 0) setSelected(first360);
              }}
              className={`p-1.5 rounded-md text-xs transition-all ${
                viewMode === "360"
                  ? "bg-neon-cyan/20 text-neon-cyan"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="360 View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Carousel View */}
      {viewMode === "carousel" && (
        <>
          <div className="relative group">
            <div
              className="relative aspect-video rounded-xl overflow-hidden cursor-pointer bg-black/20"
              onClick={() => openLightbox(selected)}
            >
              <AnimatePresence
                initial={false}
                custom={direction}
                mode="popLayout"
              >
                <motion.div
                  key={selected}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  className="absolute inset-0"
                >
                  <Image
                    src={images[selected]}
                    alt={`${roomName} - Image ${selected + 1}`}
                    fill
                    className="object-cover"
                    priority
                  />
                  {/* 360 badge */}
                  {is360Image(images[selected]) && (
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-neon-cyan/90 text-black text-xs font-bold flex items-center gap-1.5">
                      <RotateCcw className="w-3 h-3" />
                      360° View
                    </div>
                  )}
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
                  {is360Image(img) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <RotateCcw className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((img, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => {
                setSelected(i);
                openLightbox(i);
              }}
              className="relative aspect-video rounded-xl overflow-hidden group"
            >
              <Image
                src={img}
                alt={`${roomName} grid ${i + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {is360Image(img) && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-neon-cyan/90 text-black text-[10px] font-bold flex items-center gap-1">
                  <RotateCcw className="w-2.5 h-2.5" />
                  360
                </div>
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* 360 View Mode */}
      {viewMode === "360" && has360View && (
        <div className="space-y-4">
          {/* Main 360 Viewer */}
          <div
            ref={containerRef}
            className="relative aspect-[2/1] rounded-xl overflow-hidden bg-black/20 cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handlePanoramaMouseDown}
            onMouseMove={handlePanoramaMouseMove}
            onMouseUp={handlePanoramaMouseUp}
            onMouseLeave={handlePanoramaMouseUp}
          >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={`360-${selected}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute inset-0"
                style={{
                  transform: `translateX(${dragOffset * 0.5}px)`,
                }}
              >
                <Image
                  src={images[selected]}
                  alt={`${roomName} - 360 View`}
                  fill
                  className="object-cover"
                  priority
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>

            {/* 360 overlay indicator */}
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-neon-cyan/90 text-black text-xs font-bold flex items-center gap-1.5">
              <RotateCcw className="w-3 h-3 animate-spin" />
              360° Panorama
            </div>

            <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-xs text-white font-medium">
              {selected + 1} / {images.length}
            </div>

            <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-xs text-white font-medium flex items-center gap-1.5">
              <Eye className="w-3 h-3" />
              Click and drag to pan
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={() => paginate(-1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 hover:scale-110 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => paginate(1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 hover:scale-110 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* All 360 images thumbnails */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
              Panoramic Views
            </p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`relative w-28 h-18 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                    selected === i
                      ? "border-neon-cyan ring-2 ring-neon-cyan/30"
                      : "border-transparent hover:border-white/20 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${roomName} 360 thumb ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                  {is360Image(img) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <RotateCcw className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
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
              <AnimatePresence
                initial={false}
                custom={direction}
                mode="popLayout"
              >
                <motion.div
                  key={`lb-${selected}`}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={images[selected]}
                    alt={`${roomName} - Full view ${selected + 1}`}
                    fill
                    className="object-contain"
                    priority
                  />
                  {/* 360 badge in lightbox */}
                  {is360Image(images[selected]) && (
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-neon-cyan/90 text-black text-xs font-bold flex items-center gap-1.5">
                      <RotateCcw className="w-3 h-3" />
                      360° Panorama View
                    </div>
                  )}
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
                    {is360Image(img) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <RotateCcw className="w-3 h-3 text-white" />
                      </div>
                    )}
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
