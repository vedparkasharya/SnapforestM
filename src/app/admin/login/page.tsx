"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Loader2, Zap } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Logging in as admin...");

  useEffect(() => {
    const autoLogin = async () => {
      try {
        // Auto-login with hardcoded admin credentials
        const res = await fetch("/api/auth/admin-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify({
            email: "vedprakasharya9973@gmail.com",
            password: "Ved@203068",
          }),
        });

        const data = await res.json();

        if (data.success) {
          // Store admin data in localStorage
          localStorage.setItem("snapforest_admin", JSON.stringify(data.data));
          setStatus("success");
          setMessage("Login successful! Redirecting...");
          // Redirect to admin dashboard after a brief delay
          setTimeout(() => {
            router.push("/admin");
          }, 1000);
        } else {
          setStatus("error");
          setMessage(data.message || "Login failed. Please try again.");
        }
      } catch (error) {
        console.error("Auto-login error:", error);
        setStatus("error");
        setMessage("Network error. Please check your connection.");
      }
    };

    // Small delay to show the loading animation
    const timer = setTimeout(() => {
      autoLogin();
    }, 800);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-neon-purple/5" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-neon-cyan/10 rounded-full blur-[100px]" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-neon-purple/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 10, delay: 0.1 }}
          className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink flex items-center justify-center mb-6"
        >
          {status === "loading" ? (
            <Shield className="w-10 h-10 text-white" />
          ) : status === "success" ? (
            <Zap className="w-10 h-10 text-white" />
          ) : (
            <Shield className="w-10 h-10 text-white" />
          )}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold mb-2"
        >
          Admin Access
        </motion.h1>

        {/* Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-3"
        >
          {status === "loading" && (
            <Loader2 className="w-6 h-6 animate-spin text-neon-cyan" />
          )}
          <p
            className={`text-sm ${
              status === "error"
                ? "text-red-400"
                : status === "success"
                ? "text-green-400"
                : "text-muted-foreground"
            }`}
          >
            {message}
          </p>
        </motion.div>

        {/* Error retry button */}
        {status === "error" && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Try Again
          </motion.button>
        )}
      </motion.div>
    </main>
  );
}
