"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, UserPlus, Eye, EyeOff, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "register";
}

export default function AuthModal({ isOpen, onClose, defaultMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const switchMode = () => {
    resetForm();
    setMode(mode === "login" ? "register" : "login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    let result;
    if (mode === "register") {
      if (!name.trim()) {
        setError("Name is required");
        setIsSubmitting(false);
        return;
      }
      result = await register(name, email, password);
    } else {
      result = await login(email, password);
    }

    if (result.success) {
      handleClose();
      window.location.reload();
    } else {
      setError(result.message);
    }

    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 20 }}
            className="w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-card p-8 relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-cyan/20 rounded-full blur-[60px]" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-neon-purple/20 rounded-full blur-[60px]" />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition-colors z-10"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Header */}
              <div className="relative text-center space-y-2 mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10 }}
                  className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink flex items-center justify-center"
                >
                  {mode === "login" ? (
                    <LogIn className="w-7 h-7 text-white" />
                  ) : (
                    <UserPlus className="w-7 h-7 text-white" />
                  )}
                </motion.div>
                <h2 className="text-xl font-bold">
                  {mode === "login" ? "Welcome Back" : "Get Started"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {mode === "login"
                    ? "Sign in to your SnapforestX account"
                    : "Create your SnapforestX account"}
                </p>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="relative space-y-4">
                {mode === "register" && (
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full h-11 rounded-lg border border-input bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium block mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
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
                      placeholder="Min 6 characters"
                      minLength={6}
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
                  ) : mode === "login" ? (
                    <>
                      <LogIn className="w-5 h-5" />
                      Sign In
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Create Account
                    </>
                  )}
                </button>
              </form>

              {/* Switch mode */}
              <div className="relative mt-6 text-center">
                <button
                  onClick={switchMode}
                  className="text-sm text-neon-cyan hover:underline transition-colors"
                >
                  {mode === "login"
                    ? "Don't have an account? Sign Up"
                    : "Already have an account? Sign In"}
                </button>
              </div>

              {/* Demo hint */}
              <div className="relative mt-4 p-3 rounded-lg bg-neon-cyan/5 border border-neon-cyan/20">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="w-3.5 h-3.5 text-neon-cyan" />
                  <span>
                    Admin: <strong className="text-neon-cyan">admin@snapforest.com</strong> / <strong className="text-neon-cyan">Admin@123</strong>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
