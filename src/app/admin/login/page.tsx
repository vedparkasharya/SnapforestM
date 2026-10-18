"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem("snapforest_admin", JSON.stringify(data.data));
        router.push("/admin");
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (loginError) {
      console.error("Login error:", loginError);
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0d100e] px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(39,94,55,0.18),transparent_52%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b9f5ca]/20 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 w-full max-w-[430px]"
      >
        <div className="overflow-hidden rounded-[28px] border border-white/[0.11] bg-[#111512] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-[#b9f5ca]/20 bg-[#1b3826] text-[#c9f4d4]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.24em] text-[#b9f5ca]/70">SNAPFOREST · SECURE ACCESS</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Admin sign in</h1>
            <p className="mt-2 text-sm leading-6 text-white/50">Sign in to manage studios, bookings and your platform.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-medium tracking-wide text-white/75">Email address</label>
              <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" autoComplete="username" required className="h-12 w-full rounded-xl border border-white/[0.12] bg-[#0b0e0c] px-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#9cdbad]/60 focus:ring-2 focus:ring-[#9cdbad]/10" />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-xs font-medium tracking-wide text-white/75">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" required className="h-12 w-full rounded-xl border border-white/[0.12] bg-[#0b0e0c] px-4 pr-12 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#9cdbad]/60 focus:ring-2 focus:ring-[#9cdbad]/10" />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white/45 transition hover:bg-white/[0.06] hover:text-white">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-xl border border-red-400/20 bg-red-400/[0.07] p-3 text-sm text-red-300">{error}</motion.p>}

            <button type="submit" disabled={isLoading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c9f4d4] px-4 text-sm font-semibold text-[#102017] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9f4d4] disabled:cursor-not-allowed disabled:opacity-60">
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : "Sign in to admin"}
            </button>
          </form>
        </div>

        <Link href="/" className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm text-white/50 transition hover:bg-white/[0.04] hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Snapforest
        </Link>
      </motion.div>
    </main>
  );
}
