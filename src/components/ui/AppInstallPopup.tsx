"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Smartphone, Star, Check } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function AppInstallPopup() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("snapforest_install_dismissed");
    if (stored) {
      const dismissedDate = parseInt(stored);
      if (Date.now() - dismissedDate < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true);
        return;
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    if ((window as any).navigator?.standalone === true) {
      setInstalled(true);
    }

    const timer = setTimeout(() => {
      if (!dismissed && !installed) {
        setShow(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, [dismissed, installed]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
        setShow(false);
      }
      setDeferredPrompt(null);
    } else {
      setShow(false);
      const toast = document.createElement("div");
      toast.className = "fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-neon-cyan text-black px-6 py-3 rounded-full text-sm font-medium shadow-lg animate-bounce";
      toast.textContent = "SnapforestX App installed successfully!";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem("snapforest_install_dismissed", Date.now().toString());
  };

  return (
    <AnimatePresence>
      {show && !dismissed && !installed && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-md"
        >
          <div className="glass-card p-5 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-cyan/20 rounded-full blur-[60px]" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-neon-purple/20 rounded-full blur-[60px]" />

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10 transition-colors z-10"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="relative flex items-start gap-4">
              {/* App Icon */}
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink flex items-center justify-center shadow-lg">
                <Smartphone className="w-7 h-7 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg leading-tight">Get SnapforestX App</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Install our app for faster booking & exclusive deals!
                </p>

                {/* Features */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">4.9 Rating</span>
                  <span className="text-xs text-muted-foreground">10K+ Downloads</span>
                </div>

                {/* Benefits */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {["Faster Booking", "Offline Access", "Push Notifications"].map((benefit) => (
                    <span
                      key={benefit}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-neon-cyan/10 text-neon-cyan"
                    >
                      <Check className="w-3 h-3" />
                      {benefit}
                    </span>
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleInstall}
                    className="flex-1 h-10 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Install Now
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="h-10 px-4 rounded-lg border border-white/10 text-sm text-muted-foreground hover:bg-white/5 transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
