"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, UserPlus, Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";
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

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setError("");
    }
  }, [defaultMode, isOpen]);

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
    setMode((current) => current === "login" ? "register" : "login");
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
      result = await register(name.trim(), email.trim(), password);
    } else {
      result = await login(email.trim(), password);
    }

    if (result.success) {
      handleClose();
    } else {
      setError(result.message);
    }

    setIsSubmitting(false);
  };

  const goToAdminLogin = () => {
    handleClose();
    window.location.href = "/admin/login";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={handleClose}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
          >
            <div className="glass-card relative overflow-hidden p-8">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-neon-cyan/20 blur-[60px]" />
              <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-neon-purple/20 blur-[60px]" />

              <button type="button" onClick={handleClose} aria-label="Close sign in dialog" className="absolute right-4 top-4 z-10 rounded-full p-2 text-muted-foreground hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>

              <div className="relative mb-6 space-y-2 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink">
                  {mode === "login" ? <LogIn className="h-7 w-7 text-white" /> : <UserPlus className="h-7 w-7 text-white" />}
                </div>
                <h2 id="auth-modal-title" className="text-xl font-bold">{mode === "login" ? "Welcome Back" : "Get Started"}</h2>
                <p className="text-sm text-muted-foreground">{mode === "login" ? "Sign in to your Snapforest account" : "Create your Snapforest account"}</p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} role="alert" className="relative mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-400">
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="relative space-y-4">
                {mode === "register" && (
                  <div>
                    <label htmlFor="auth-name" className="mb-1.5 block text-sm font-medium">Full Name</label>
                    <input id="auth-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" autoComplete="name" maxLength={100} className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring" required />
                  </div>
                )}

                <div>
                  <label htmlFor="auth-email" className="mb-1.5 block text-sm font-medium">Email</label>
                  <input id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" maxLength={254} className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring" required />
                </div>

                <div>
                  <label htmlFor="auth-password" className="mb-1.5 block text-sm font-medium">Password</label>
                  <div className="relative">
                    <input id="auth-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} maxLength={128} autoComplete={mode === "login" ? "current-password" : "new-password"} className="h-11 w-full rounded-lg border border-input bg-background px-4 pr-12 text-sm outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring" required />
                    <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:bg-white/10 hover:text-white">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : mode === "login" ? <><LogIn className="h-5 w-5" />Sign In</> : <><UserPlus className="h-5 w-5" />Create Account</>}
                </button>
              </form>

              <div className="relative mt-6 text-center">
                <button type="button" onClick={switchMode} className="text-sm text-neon-cyan hover:underline">
                  {mode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
              </div>

              <div className="relative mt-4 border-t border-white/10 pt-4">
                <button type="button" onClick={goToAdminLogin} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-neon-cyan/40 py-2.5 text-sm text-neon-cyan transition-colors hover:bg-neon-cyan/10">
                  <ShieldCheck className="h-4 w-4" />
                  Sign in as Admin
                </button>
                <p className="mt-2 text-center text-xs text-muted-foreground">Admin access only. You will be redirected to the admin login.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
