"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn, LogOut, UserCircle, ChevronDown, ArrowUpRight, Search, Moon } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import AuthModal from "@/components/auth/AuthModal";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 14);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setIsOpen(false), [pathname]);

  const openLogin = () => {
    setAuthMode("login");
    setShowAuthModal(true);
  };

  const openRegister = () => {
    setAuthMode("register");
    setShowAuthModal(true);
  };

  const isActive = (path: string) => pathname === path || (path === "/rooms" && pathname.startsWith("/rooms/"));

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5"
      >
        <div className={`mx-auto w-full max-w-[1600px] rounded-[24px] border px-3 transition-all duration-500 sm:px-5 ${scrolled ? "border-white/[0.13] bg-[#07111e]/95 shadow-2xl backdrop-blur-2xl" : "border-white/[0.1] bg-[#07111e]/90 backdrop-blur-xl"}`}>
          <div className="flex h-[62px] items-center justify-between gap-3 sm:h-[66px]">
            <Link href="/" className="group flex items-center gap-2.5" aria-label="Snapforest home">
              <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] shadow-sm">
                <img src="/logo.png" alt="" className="h-7 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
              </span>
              <span className="hidden text-sm font-semibold tracking-[-0.02em] text-white sm:block">Snapforest</span>
            </Link>

            <div className="hidden items-center gap-1.5 lg:flex">
              <NavLink href="/" label="Home" active={pathname === "/"} />
              <NavLink href="/rooms" label="Studios" active={isActive("/rooms")} />
              <NavLink href="/dashboard" label="Bookings" active={pathname === "/dashboard"} />
              <NavLink href="/rooms#pricing" label="Pricing" active={pathname === "/rooms#pricing"} />
              <NavLink href="/#how-it-works" label="How it works" active={false} />
              <NavLink href="/rooms" label="Creator Hub" active={false} />
            </div>

            <div className="flex items-center gap-2">
              <Link href="/rooms" aria-label="Search studios" className="hidden h-9 w-9 items-center justify-center rounded-full text-white/85 transition hover:bg-white/10 md:flex"><Search className="h-5 w-5"/></Link>
              <button type="button" aria-label="Toggle appearance" onClick={() => document.documentElement.classList.toggle("sf-light-mode")} className="hidden h-9 w-9 items-center justify-center rounded-full text-white/85 transition hover:bg-white/10 md:flex"><Moon className="h-5 w-5"/></button>
              {isLoggedIn ? (
                <div className="relative">
                  <button type="button" onClick={() => setShowProfile((value) => !value)} className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-1.5 text-white transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9ff4f]">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-xs font-bold text-[#101722]">{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
                    <span className="hidden max-w-[100px] truncate text-sm text-white/80 sm:block">{user?.name}</span>
                    <ChevronDown className={`h-3.5 w-3.5 text-white/40 transition-transform ${showProfile ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {showProfile && (
                      <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }} className="absolute right-0 top-12 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#151817]/95 p-1 shadow-2xl backdrop-blur-2xl">
                        <div className="rounded-xl px-3 py-3">
                          <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
                          <p className="mt-0.5 truncate text-xs text-white/45">{user?.email}</p>
                          {isAdmin && <span className="mt-2 inline-flex rounded-full bg-[#b9f5ca]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#b9f5ca]">Admin</span>}
                        </div>
                        {isAdmin && <Link href="/admin" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/[0.06] hover:text-white"><ArrowUpRight className="h-4 w-4" /> Admin dashboard</Link>}
                        <button type="button" onClick={() => { logout(); setShowProfile(false); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-red-300 hover:bg-red-400/[0.07]"><LogOut className="h-4 w-4" /> Logout</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden items-center gap-1.5 sm:flex">
                  <button type="button" onClick={openLogin} className="rounded-full px-3.5 py-2 text-sm text-white/65 transition-colors hover:bg-white/[0.05] hover:text-white">Sign in</button>
                  <Link href="/rooms" className="inline-flex items-center gap-1.5 rounded-full bg-[#d9ff4f] px-4 py-2.5 text-sm font-bold text-[#101722] transition-transform hover:-translate-y-0.5 hover:bg-[#e8ff91]">Book a studio <ArrowUpRight className="h-3.5 w-3.5" /></Link>
                </div>
              )}

              <button type="button" aria-label={isOpen ? "Close menu" : "Open menu"} aria-expanded={isOpen} onClick={() => setIsOpen((value) => !value)} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white md:hidden">
                {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/[0.08] md:hidden">
                <div className="space-y-1 py-3">
                  <MobileLink href="/" label="Home" active={pathname === "/"} />
                  <MobileLink href="/rooms" label="Studios" active={isActive("/rooms")} />
                  {isLoggedIn && <MobileLink href="/dashboard" label="Bookings" active={pathname === "/dashboard"} />}
                  {isAdmin && <MobileLink href="/admin" label="Admin" active={pathname === "/admin"} />}
                  <div className="mt-2 border-t border-white/[0.08] pt-2">
                    {isLoggedIn ? (
                      <button type="button" onClick={() => logout()} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-300"><LogOut className="h-4 w-4" /> Logout</button>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={openLogin} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-3 text-sm text-white/70"><LogIn className="h-4 w-4" /> Sign in</button>
                        <button type="button" onClick={openRegister} className="flex items-center justify-center gap-2 rounded-xl bg-[#d9f7e2] px-3 py-3 text-sm font-semibold text-[#102017]"><UserCircle className="h-4 w-4" /> Create account</button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultMode={authMode} />
    </>
  );
}

function NavLink({ href, label, active, special }: { href: string; label: string; active: boolean; special?: boolean }) {
  return <Link href={href} className={`rounded-full px-3.5 py-2.5 text-[13px] font-semibold transition-colors ${active ? "bg-[#d9ff4f] text-[#101722] shadow-sm" : special ? "text-[#d9ff4f] hover:bg-[#d9ff4f]/10" : "text-white/80 hover:bg-white/[0.07] hover:text-white"}`}>{label}</Link>;
}

function MobileLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return <Link href={href} className={`flex items-center justify-between rounded-xl px-3 py-3 text-sm ${active ? "bg-white/[0.08] text-white" : "text-white/65"}`}>{label}<ArrowUpRight className="h-4 w-4 text-white/25" /></Link>;
}
