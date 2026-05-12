import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import AppInstallPopup from "@/components/ui/AppInstallPopup";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SnapforestX - Creator Studio Booking Platform",
  description:
    "Book premium podcast studios, YouTube setups, music rooms, photo studios, and creator spaces in Patna. Hourly and daily bookings with instant confirmation.",
  keywords: [
    "creator studio",
    "podcast studio",
    "YouTube studio",
    "music room",
    "photo studio",
    "booking",
    "Patna",
    "Bihar",
  ],
  openGraph: {
    title: "SnapforestX - Creator Studio Booking",
    description: "Book creator studios in Patna - Podcast, YouTube, Music, Photo & more",
    type: "website",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SnapforestX",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <ThemeProvider>
            <Navbar />
            <div className="min-h-screen">{children}</div>
            <Footer />
            <AppInstallPopup />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
