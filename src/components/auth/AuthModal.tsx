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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (mode === "register" && !name.trim()) {
        setError("Name is required");
        return;
      }

      const result = mode === "register"
        ? await register(name.trim(), email.trim(), password)
        : await login(email.trim(), password);

      if (result.success) handleClose();
      else setError(result.message);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#070907]/95 px-4 py-6 backdrop-blur-md"
          onClick={handleClose}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.985 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative my-auto w-full max-w-[430px]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
          >
            <div className="relative overflow-hidden rounded-[28px] border border-white/[0.12] bg-[#111512] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.7)] sm:p-8">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b9f5ca]/40 to-transparent" />

              <button
                type="button"
                onClick={handleClose}
                aria-label="Close sign in dialog"
                className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/60 transition hover:bg-white/[0.09] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9f5ca]"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-7 space-y-3 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[#b9f5ca]/20 bg-[#1b3826] text-[#c9f4d4] shadow-[0_8px_30px_rgba(26,71,42,0.24)]">
                  {mode === "login" ? <LogIn className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.24em] text-[#b9f5ca]/70">SNAPFOREST · CREATOR SPACES</p>
                  <h2 id="auth-modal-title" className="text-2xl font-semibold tracking-tight text-white">
                    {mode === "login" ? "Welcome back" : "Create your account"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    {mode === "login" ? "Sign in to manage your bookings and spaces." : "Join Snapforest and find your creative space."}
                  </p>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="mb-4 rounded-xl border border-red-400/20 bg-red-400/[0.07] p-3 text-sm text-red-300"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                  <div>
                    <label htmlFor="auth-name" className="mb-2 block text-xs font-medium tracking-wide text-white/75">Full name</label>
                    <input id="auth-name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" autoComplete="name" maxLength={100} className="h-12 w-full rounded-xl border border-white/[0.12] bg-[#0b0e0c] px-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#9cdbad]/60 focus:ring-2 focus:ring-[#9cdbad]/10" required />
                  </div>
                )}

                <div>
                  <label htmlFor="auth-email" className="mb-2 block text-xs font-medium tracking-wide text-white/75">Email address</label>
                  <input id="auth-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" maxLength={254} className="h-12 w-full rounded-xl border border-white/[0.12] bg-[#0b0e0c] px-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#9cdbad]/60 focus:ring-2 focus:ring-[#9cdbad]/10" required />
                </div>

                <div>
                  <label htmlFor="auth-password" className="mb-2 block text-xs font-medium tracking-wide text-white/75">Password</label>
                  <div className="relative">
                    <input id="auth-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" minLength={6} maxLength={128} autoComplete={mode === "login" ? "current-password" : "new-password"} className="h-12 w-full rounded-xl border border-white/[0.12] bg-[#0b0e0c] px-4 pr-12 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#9cdbad]/60 focus:ring-2 focus:ring-[#9cdbad]/10" required />
                    <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white/45 transition hover:bg-white/[0.06] hover:text-white">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c9f4d4] px-4 text-sm font-semibold text-[#102017] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9f4d4] disabled:cursor-not-allowed disabled:opacity-60">
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : mode === "login" ? <><LogIn className="h-4 w-4" /> Sign in</> : <><UserPlus className="h-4 w-4" /> Create account</>}
                </button>
              </form>

              <div className="mt-5 text-center">
                <button type="button" onClick={switchMode} className="text-sm text-[#b9f5ca] transition hover:text-white hover:underline hover:underline-offset-4">
                  {mode === "login" ? "New to Snapforest? Create an account" : "Already have an account? Sign in"}
                </button>
              </div>

              <div className="mt-6 border-t border-white/[0.09] pt-5">
                <button type="button" onClick={goToAdminLogin} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.025] text-sm text-white/70 transition hover:border-[#b9f5ca]/30 hover:bg-[#b9f5ca]/[0.05] hover:text-white">
                  <ShieldCheck className="h-4 w-4 text-[#b9f5ca]" /> Sign in as admin
                </button>
                <p className="mt-2 text-center text-xs leading-5 text-white/40">For authorised administrators only.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
