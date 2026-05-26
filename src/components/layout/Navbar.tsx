"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  Calendar,
  LayoutDashboard,
  Shield,
  LogIn,
  LogOut,
  UserCircle,
  ChevronDown,
  Sparkles,
} from "lucide-react";
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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openLogin = () => {
    setAuthMode("login");
    setShowAuthModal(true);
  };
  const openRegister = () => {
    setAuthMode("register");
    setShowAuthModal(true);
  };
  const isActive = (path: string) => pathname === path;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#111111]/90 backdrop-blur-xl border-b border-white/[0.08]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <motion.img
                src="/logo.png"
                alt="Snapforest"
                className="h-10 w-auto object-contain"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="text-lg tracking-[-0.02em] font-medium text-white hidden sm:block"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                Snapforest
              </motion.span>
            </Link>

            {/* Center Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink
                href="/"
                label="Studios"
                active={isActive("/") || isActive("/rooms")}
              />
              <NavLink
                href="/rooms"
                label="Explore"
                active={isActive("/rooms")}
              />
              <NavLink
                href="/dashboard"
                label="Dashboard"
                active={isActive("/dashboard")}
              />
              {isAdmin && (
                <NavLink
                  href="/admin"
                  label="Admin"
                  active={isActive("/admin")}
                  special
                />
              )}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#1a472a] flex items-center justify-center text-white text-xs font-medium">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <span className="text-sm hidden sm:inline max-w-[80px] truncate">
                      {user?.name}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#888888]" />
                  </button>
                  <AnimatePresence>
                    {showProfile && (
                      <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-10 w-48 glass-card overflow-hidden z-50"
                      >
                        <div className="p-3 border-b border-white/5">
                          <p className="font-medium text-sm truncate">
                            {user?.name}
                          </p>
                          <p className="text-xs text-[#888888] truncate">
                            {user?.email}
                          </p>
                          {isAdmin && (
                            <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-[#1a472a]/30 text-[#c8e6c9] font-mono">
                              Admin
                            </span>
                          )}
                        </div>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                            onClick={() => setShowProfile(false)}
                          >
                            <Shield className="w-4 h-4 text-[#1a472a]" />
                            Dashboard
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            setShowProfile(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openLogin}
                    className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-pill text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </button>
                  <Link href="/rooms">
                    <motion.span
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-pill text-sm font-medium bg-[#1a472a] text-white hover:bg-[#236b3a] transition-colors cursor-pointer"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Sparkles className="w-4 h-4" />
                      Book a Studio
                    </motion.span>
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden border-t border-white/5 bg-[#111111]/95 backdrop-blur-xl"
            >
              <div className="px-4 py-4 space-y-1">
                <MobileLink
                  href="/"
                  label="Studios"
                  active={isActive("/")}
                  onClick={() => setIsOpen(false)}
                />
                <MobileLink
                  href="/rooms"
                  label="Explore"
                  active={isActive("/rooms")}
                  onClick={() => setIsOpen(false)}
                />
                <MobileLink
                  href="/dashboard"
                  label="Dashboard"
                  active={isActive("/dashboard")}
                  onClick={() => setIsOpen(false)}
                />
                {isAdmin && (
                  <MobileLink
                    href="/admin"
                    label="Admin Panel"
                    active={isActive("/admin")}
                    special
                    onClick={() => setIsOpen(false)}
                  />
                )}
                <div className="pt-2 border-t border-white/5">
                  {isLoggedIn ? (
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  ) : (
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          openLogin();
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70"
                      >
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          openRegister();
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#c8e6c9] bg-[#1a472a]/30"
                      >
                        <UserCircle className="w-4 h-4" />
                        Sign Up
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
    </>
  );
}

function NavLink({
  href,
  label,
  active,
  special,
}: {
  href: string;
  label: string;
  active: boolean;
  special?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
        active
          ? special
            ? "bg-[#1a472a]/20 text-[#c8e6c9]"
            : "text-white"
          : special
          ? "text-[#c8e6c9] hover:bg-[#1a472a]/10"
          : "text-white/70 hover:text-white hover:bg-white/5"
      }`}
    >
      {label}
    </Link>
  );
}

function MobileLink({
  href,
  label,
  active,
  special,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  special?: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
        active
          ? special
            ? "bg-[#1a472a]/20 text-[#c8e6c9]"
            : "bg-white/10 text-white"
          : special
          ? "text-[#c8e6c9]"
          : "text-white/70"
      }`}
    >
      {label}
    </Link>
  );
}
