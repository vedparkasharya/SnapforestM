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
  User,
  Sparkles,
  Download,
  Heart,
  Bell,
  Search,
  Zap,
  Star,
  ChevronDown,
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const pathname = usePathname();

  // Check admin status
  useEffect(() => {
    const checkAdmin = () => {
      try {
        const stored = localStorage.getItem("snapforest_admin");
        if (stored) {
          const parsed = JSON.parse(stored);
          setIsAdmin(parsed?.role === "admin");
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
    window.addEventListener("storage", checkAdmin);
    const interval = setInterval(checkAdmin, 1000);
    return () => {
      window.removeEventListener("storage", checkAdmin);
      clearInterval(interval);
    };
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("snapforest_admin");
    setIsAdmin(false);
    window.location.href = "/";
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.span
              className="text-2xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent"
              whileHover={{ scale: 1.02 }}
            >
              SnapforestX
            </motion.span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink href="/" icon={<Home className="w-4 h-4" />} label="Home" active={isActive("/")} />
            <NavLink href="/rooms" icon={<Calendar className="w-4 h-4" />} label="Rooms" active={isActive("/rooms")} />
            <NavLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" active={isActive("/dashboard")} />

            {/* Admin Link - Only show if logged in */}
            {isAdmin && (
              <NavLink
                href="/admin"
                icon={<Shield className="w-4 h-4" />}
                label="Admin"
                active={isActive("/admin")}
                special
              />
            )}

            {/* Auth Buttons */}
            {isAdmin ? (
              <div className="relative ml-2">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-white text-xs font-bold">
                    A
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
                <AnimatePresence>
                  {showProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute right-0 top-10 w-48 glass-card overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-white/5">
                        <p className="font-medium text-sm">Admin User</p>
                        <p className="text-xs text-muted-foreground">admin@snapforest.com</p>
                      </div>
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                        onClick={() => setShowProfile(false)}
                      >
                        <Shield className="w-4 h-4 text-neon-cyan" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-white/5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Admin Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-white/5" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-1">
              <MobileLink href="/" icon={<Home className="w-4 h-4" />} label="Home" active={isActive("/")} onClick={() => setIsOpen(false)} />
              <MobileLink href="/rooms" icon={<Calendar className="w-4 h-4" />} label="Rooms" active={isActive("/rooms")} onClick={() => setIsOpen(false)} />
              <MobileLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" active={isActive("/dashboard")} onClick={() => setIsOpen(false)} />

              {isAdmin && (
                <MobileLink href="/admin" icon={<Shield className="w-4 h-4" />} label="Admin Panel" active={isActive("/admin")} special onClick={() => setIsOpen(false)} />
              )}

              <div className="pt-2 border-t border-white/5">
                {isAdmin ? (
                  <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                ) : (
                  <MobileLink href="/admin/login" icon={<LogIn className="w-4 h-4" />} label="Admin Login" active={isActive("/admin/login")} onClick={() => setIsOpen(false)} />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavLink({ href, icon, label, active, special }: { href: string; icon: React.ReactNode; label: string; active: boolean; special?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
        active
          ? special
            ? "bg-neon-cyan/10 text-neon-cyan"
            : "bg-white/10 text-foreground"
          : special
          ? "text-neon-cyan hover:bg-neon-cyan/10"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileLink({ href, icon, label, active, special, onClick }: { href: string; icon: React.ReactNode; label: string; active: boolean; special?: boolean; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
        active
          ? special
            ? "bg-neon-cyan/10 text-neon-cyan"
            : "bg-white/10 text-foreground"
          : special
          ? "text-neon-cyan"
          : "text-muted-foreground"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
