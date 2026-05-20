"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone, Check, Share, ArrowUpFromLine, Zap, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * PWA Install Prompt Component
 *
 * Shows a REAL install prompt for the Snapforest PWA.
 * Uses the beforeinstallprompt event to trigger the browser's native install flow.
 *
 * Features:
 * - Android/Chrome: Native install prompt via beforeinstallprompt
 * - iOS Safari: Shows step-by-step instructions
 * - Desktop Chrome/Edge: Native install prompt
 * - Auto-dismisses after 24 hours
 * - Detects if already installed
 */
export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const checkStandalone = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(standalone);
      setIsInstalled(standalone);
    };

    checkStandalone();

    // Listen for display mode changes
    const displayModeQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
      setIsStandalone(e.matches);
    };
    displayModeQuery.addEventListener("change", handleDisplayChange);

    // Detect iOS Safari (which doesn't support beforeinstallprompt)
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for the beforeinstallprompt event (Chrome/Edge/Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("[PWA] beforeinstallprompt event captured");
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e);
      // Show the install prompt UI
      setShowPrompt(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log("[PWA] App was installed");
      setDeferredPrompt(null);
      setIsInstalled(true);
      setShowPrompt(false);
      // Store installation status
      localStorage.setItem("pwa-installed", "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Show prompt logic
    const promptDismissed = localStorage.getItem("pwa-prompt-dismissed");
    const dismissedTime = promptDismissed ? parseInt(promptDismissed) : 0;
    const oneDay = 24 * 60 * 60 * 1000;
    const shouldShowPrompt = Date.now() - dismissedTime > oneDay;

    // For iOS, show custom instructions after a delay
    if (isIOSDevice && shouldShowPrompt && !standalone) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
      return () => {
        clearTimeout(timer);
        displayModeQuery.removeEventListener("change", handleDisplayChange);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }

    // If beforeinstallprompt was already fired before component mounted
    // (can happen on fast navigations), check if we have the prompt
    if ((window as any).deferredPrompt && shouldShowPrompt && !standalone) {
      setDeferredPrompt((window as any).deferredPrompt);
      setShowPrompt(true);
    }

    return () => {
      displayModeQuery.removeEventListener("change", handleDisplayChange);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      // iOS doesn't support beforeinstallprompt, instructions are shown instead
      return;
    }

    if (!deferredPrompt) {
      console.log("[PWA] No deferred prompt available");
      // Try to show browser's native install UI as fallback
      showToast("Please use your browser menu to install this app", "info");
      return;
    }

    // Show the native install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond
    try {
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] User response to install prompt: ${outcome}`);

      if (outcome === "accepted") {
        setIsInstalled(true);
        showToast("App installed successfully!", "success");
      } else {
        showToast("You can install anytime from your browser menu", "info");
      }
    } catch (err) {
      console.error("[PWA] Error during install:", err);
    }

    // Clear the deferred prompt - can only be used once
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal time
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    // Dispatch a custom event that ToastProvider can listen to
    window.dispatchEvent(
      new CustomEvent("pwa-toast", {
        detail: { message, type },
      })
    );
  };

  // Don't show if already installed
  if (isInstalled || isStandalone) {
    return null;
  }

  // Don't show on first load if prompt was dismissed recently
  // (handled in useEffect)

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md"
        >
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-neon-cyan/20 rounded-2xl p-5 shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center border border-neon-cyan/30">
                  <Smartphone className="w-6 h-6 text-neon-cyan" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">
                    Install Snapforest App
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Quick access from your home screen
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* iOS Instructions */}
            {isIOS ? (
              <div className="space-y-3 mb-4">
                <p className="text-xs text-muted-foreground">
                  To install Snapforest on your iPhone/iPad:
                </p>
                <ol className="space-y-2">
                  <li className="flex items-center gap-3 text-xs text-white">
                    <span className="w-6 h-6 rounded-full bg-neon-cyan/20 flex items-center justify-center text-[10px] font-bold flex-shrink-0 border border-neon-cyan/30">
                      1
                    </span>
                    <span className="flex items-center gap-1.5">
                      Tap the <Share className="w-3.5 h-3.5 text-neon-cyan inline" /> Share button in Safari
                    </span>
                  </li>
                  <li className="flex items-center gap-3 text-xs text-white">
                    <span className="w-6 h-6 rounded-full bg-neon-cyan/20 flex items-center justify-center text-[10px] font-bold flex-shrink-0 border border-neon-cyan/30">
                      2
                    </span>
                    <span className="flex items-center gap-1.5">
                      Scroll down and tap <strong className="text-neon-cyan">Add to Home Screen</strong>
                    </span>
                  </li>
                  <li className="flex items-center gap-3 text-xs text-white">
                    <span className="w-6 h-6 rounded-full bg-neon-cyan/20 flex items-center justify-center text-[10px] font-bold flex-shrink-0 border border-neon-cyan/30">
                      3
                    </span>
                    Tap <strong className="text-neon-cyan">Add</strong> to install
                  </li>
                </ol>
                <div className="flex items-center justify-center mt-3">
                  <ArrowUpFromLine className="w-5 h-5 text-neon-cyan animate-bounce" />
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Install Snapforest for quick access, offline browsing, and a native app-like experience on your device.
                </p>
                <div className="flex items-center gap-4 mt-3">
                  {[
                    { label: "Fast Access", icon: Zap },
                    { label: "Works Offline", icon: Wifi },
                    { label: "No App Store", icon: Check },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1 text-[10px] text-neon-cyan/80">
                      <item.icon className="w-3 h-3" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs hover:bg-white/5"
                onClick={handleDismiss}
              >
                Not Now
              </Button>
              {!isIOS && (
                <Button
                  variant="neon"
                  size="sm"
                  className="flex-[2] text-xs hover:shadow-[0_0_20px_rgba(0,245,212,0.3)]"
                  onClick={handleInstall}
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Install App
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
