import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import ChatBot from "@/components/chatbot/ChatBot";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-primary",
  display: "swap",
  preload: true,
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Snapforest - Creator Studio Booking Platform",
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
    title: "Snapforest - Creator Studio Booking",
    description: "Book creator studios in Patna - Podcast, YouTube, Music, Photo & more",
    type: "website",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Snapforest",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0f" },
    { media: "(prefers-color-scheme: light)", color: "#0f0f0f" },
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="font-sans antialiased bg-[#0f0f0f] text-white min-h-screen">
        {/* Global Background Grid */}
        <div 
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, rgba(255,255,255,0.015) 1px, transparent 0)
            `,
            backgroundSize: '32px 32px',
          }}
        />
        
        <AuthProvider>
          <ToastProvider>
            <ThemeProvider>
              <div className="relative z-10">
                <Navbar />
                <main className="min-h-screen">{children}</main>
                <Footer />
                <ChatBot />
              </div>
            </ThemeProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
