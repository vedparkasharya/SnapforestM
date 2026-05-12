"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  Home,
  Calendar,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isAdmin = (session?.user as any)?.role === "admin";

  // Debug session state
  useEffect(() => {
    console.log("[Navbar] Session status:", status);
    console.log("[Navbar] Session data:", session);
    console.log("[Navbar] User:", session?.user);
    console.log("[Navbar] IsAdmin:", isAdmin);
  }, [session, status, isAdmin]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Force session update on mount to ensure fresh session
  useEffect(() => {
    const refreshSession = async () => {
      if (status === "authenticated") {
        console.log("[Navbar] Forcing session update");
        await update();
      }
    };
    refreshSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignIn = async () => {
    const result = await signIn("google", {
      callbackUrl: window.location.href,
      redirect: false,
    });
    console.log("[Navbar] SignIn result:", result);
    if (result?.ok) {
      console.log("[Navbar] Sign in successful, refreshing session...");
      router.refresh();
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/", redirect: true });
  };

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
            <span className="text-2xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
              SnapforestX
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              href="/rooms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Calendar className="w-4 h-4" />
              Rooms
            </Link>

            {/* Show loading state */}
            {status === "loading" && (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            )}

            {/* Show authenticated state */}
            {status === "authenticated" && session?.user && (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors flex items-center gap-1"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-3 pl-4 border-l border-white/10">
                  <div className="flex items-center space-x-2">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-8 h-8 rounded-full ring-2 ring-neon-cyan/30"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="text-sm font-medium max-w-[120px] truncate">
                      {session.user.name || "User"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}

            {/* Show unauthenticated state */}
            {status === "unauthenticated" && (
              <Button variant="neon" size="sm" onClick={handleSignIn}>
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/5"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
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
            <div className="px-4 py-4 space-y-3">
              <Link
                href="/"
                className="block py-2 text-sm"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/rooms"
                className="block py-2 text-sm"
                onClick={() => setIsOpen(false)}
              >
                Rooms
              </Link>

              {status === "loading" && (
                <div className="flex items-center space-x-2 py-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading session...</span>
                </div>
              )}

              {status === "authenticated" && session?.user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block py-2 text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block py-2 text-sm text-neon-cyan"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <div className="flex items-center gap-3 py-2 border-t border-white/5">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || ""}
                        className="w-8 h-8 rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="text-sm font-medium">
                      {session.user.name || "User"}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-2 py-2 text-sm text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                status === "unauthenticated" && (
                  <Button
                    variant="neon"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      handleSignIn();
                      setIsOpen(false);
                    }}
                  >
                    Sign In with Google
                  </Button>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
