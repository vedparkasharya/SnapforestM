"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, LogIn, Eye, EyeOff, Loader2, AlertTriangle, ArrowLeft, Fingerprint, Lock, AtSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
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
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-neon-cyan" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-black">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-neon-cyan/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-neon-pink/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to home */}
        <motion.a
          href="/"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </motion.a>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 120 }}
          className="glass-card p-8 space-y-6 relative overflow-hidden"
        >
          {/* Security border glow */}
          <div className="absolute inset-0 rounded-2xl border border-neon-cyan/20 pointer-events-none" />
          
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-neon-cyan/40 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-neon-cyan/40 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-neon-cyan/40 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-neon-cyan/40 rounded-br-2xl" />

          {/* Logo */}
          <div className="text-center space-y-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10, delay: 0.1 }}
              className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink flex items-center justify-center shadow-lg shadow-neon-cyan/20"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Admin <span className="text-neon-cyan">Portal</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Secure administrator access only</p>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-4 py-2 px-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-1.5 text-xs text-neon-cyan">
              <Lock className="w-3 h-3" />
              <span>256-bit Encryption</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5 text-xs text-neon-purple">
              <Fingerprint className="w-3 h-3" />
              <span>Secure Auth</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5 text-xs text-neon-pink">
              <AlertTriangle className="w-3 h-3" />
              <span>Protected</span>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: shake ? [0, -10, 10, -10, 10, 0] : 0
              }}
              transition={{ duration: 0.5 }}
              className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center flex items-center gap-2 justify-center"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5 text-muted-foreground" />
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full h-12 rounded-lg border border-input bg-background/80 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 focus-visible:border-neon-cyan/50 transition-all"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secure password"
                  className="w-full h-12 rounded-lg border border-input bg-background/80 px-4 pr-12 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 focus-visible:border-neon-cyan/50 transition-all"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-12 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-neon-cyan/20"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Secure Admin Login
                </>
              )}
            </motion.button>
          </form>

          {/* Security notice */}
          <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Unauthorized access attempts are logged and monitored. All actions are recorded for security purposes. This system is protected by multi-layer authentication.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground/50 mt-6"
        >
          SnapforestX Admin Portal v2.0 &bull; Protected by SHA-256 HMAC
        </motion.p>
      </div>
    </div>
  );
}
