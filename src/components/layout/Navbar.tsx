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
  ChevronDown,
  UserCircle,
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

  const handleScroll = () => {
    setScrolled(window.scrollY > 20);
  };

  useEffect(() => {
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
                className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent"
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

              {/* Admin Link - Only show if admin logged in */}
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
              {isLoggedIn ? (
                <div className="relative ml-2">
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {user?.image ? (
                      <img src={user.image} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-white text-xs font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                    <span className="text-sm max-w-[80px] truncate">{user?.name}</span>
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
                          <p className="font-medium text-sm truncate">{user?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                          {isAdmin && (
                            <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-neon-cyan/20 text-neon-cyan">
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
                            <Shield className="w-4 h-4 text-neon-cyan" />
                            Dashboard
                          </Link>
                        )}
                        <button
                          onClick={() => { logout(); setShowProfile(false); }}
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
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={openLogin}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </button>
                  <button
                    onClick={openRegister}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 transition-colors"
                  >
                    <UserCircle className="w-4 h-4" />
                    Sign Up
                  </button>
                </div>
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
                  {isLoggedIn ? (
                    <>
                      <div className="px-3 py-2 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-white text-xs font-bold">
                          {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user?.name}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      <button onClick={() => { logout(); setIsOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive">
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <div className="space-y-1">
                      <button onClick={() => { openLogin(); setIsOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground">
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </button>
                      <button onClick={() => { openRegister(); setIsOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neon-cyan bg-neon-cyan/10">
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
      </nav>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultMode={authMode} />
    </>
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
