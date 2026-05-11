"use client";

import { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = (session?.user as any)?.role === "admin";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5 rounded-none">
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
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Home className="inline w-4 h-4 mr-1" />
              Home
            </Link>
            <Link href="/rooms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Calendar className="inline w-4 h-4 mr-1" />
              Rooms
            </Link>
            {session?.user ? (
              <>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <LayoutDashboard className="inline w-4 h-4 mr-1" />
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors">
                    <Shield className="inline w-4 h-4 mr-1" />
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-3 pl-4 border-l border-white/10">
                  <div className="flex items-center space-x-2">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || ""}
                        className="w-8 h-8 rounded-full ring-2 ring-neon-cyan/30"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="text-sm font-medium">{session.user.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut()}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Button variant="neon" size="sm" onClick={() => signIn("google")}>
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/5"
            onClick={() => setIsOpen(!isOpen)}
          >
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
            <div className="px-4 py-4 space-y-3">
              <Link href="/" className="block py-2 text-sm" onClick={() => setIsOpen(false)}>Home</Link>
              <Link href="/rooms" className="block py-2 text-sm" onClick={() => setIsOpen(false)}>Rooms</Link>
              {session?.user ? (
                <>
                  <Link href="/dashboard" className="block py-2 text-sm" onClick={() => setIsOpen(false)}>Dashboard</Link>
                  {isAdmin && (
                    <Link href="/admin" className="block py-2 text-sm text-neon-cyan" onClick={() => setIsOpen(false)}>Admin Panel</Link>
                  )}
                  <button
                    onClick={() => { signOut(); setIsOpen(false); }}
                    className="flex items-center space-x-2 py-2 text-sm text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Button variant="neon" size="sm" className="w-full" onClick={() => { signIn("google"); setIsOpen(false); }}>
                  Sign In with Google
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
