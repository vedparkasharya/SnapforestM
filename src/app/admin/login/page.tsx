"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, LogIn, Eye, EyeOff, Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { adminLogin, isAdmin, isLoading } = useAuth();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!isLoading && isAdmin) {
      router.push("/admin");
    }
  }, [isAdmin, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await adminLogin(email, password);

    if (result.success) {
      window.location.href = "/admin";
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  const fillDemo = () => {
    setEmail("admin@snapforest.com");
    setPassword("Admin@123");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-neon-cyan/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-purple/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-neon-pink/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 space-y-6"
        >
          {/* Logo */}
          <div className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
              className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink flex items-center justify-center"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold">
              Admin <span className="text-neon-cyan">Login</span>
            </h1>
            <p className="text-sm text-muted-foreground">Secure access to admin dashboard</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@snapforest.com"
                className="w-full h-11 rounded-lg border border-input bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 rounded-lg border border-input bg-background px-4 pr-12 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Login to Dashboard
                </>
              )}
            </button>
          </form>

          <button
            onClick={fillDemo}
            className="w-full py-2.5 rounded-lg border border-dashed border-neon-cyan/40 text-neon-cyan text-sm hover:bg-neon-cyan/10 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Use Demo Credentials
          </button>

          <div className="text-center">
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to Home
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
