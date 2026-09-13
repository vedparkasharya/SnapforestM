import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import ChatBot from "@/components/chatbot/ChatBot";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";
import { JsonLd } from "@/components/seo/JsonLd";

const inter = Inter({ subsets: ["latin"], variable: "--font-display", display: "swap", preload: true });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: ["400"], style: ["normal", "italic"], variable: "--font-primary", display: "swap", preload: true });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap", preload: true });

const ICON_VERSION = "v5";

export const metadata: Metadata = {
  metadataBase: new URL("https://snapforest.in"),
  title: { default: "Snapforest — Creator spaces, made easy", template: "%s | Snapforest" },
  description: "Discover creator-ready studios in Patna, compare the setup and book a time that fits your session.",
  keywords: ["Snapforest", "creator studio Patna", "podcast studio Patna", "YouTube studio Patna", "photo studio Patna", "music room Patna", "studio booking Patna"],
  authors: [{ name: "Ved Prakash Arya" }],
  creator: "Ved Prakash Arya",
  publisher: "Snapforest",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Snapforest — Creator spaces, made easy",
    description: "Discover creator-ready studios in Patna and book the time you need.",
    url: "https://snapforest.in",
    siteName: "Snapforest",
    locale: "en_IN",
    type: "website",
    images: [{ url: `/rooms/photo-studio.jpg?${ICON_VERSION}`, width: 1200, height: 900, alt: "Creator studio space on Snapforest" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Snapforest — Creator spaces, made easy",
    description: "Discover creator-ready studios in Patna and book the time you need.",
    images: [`/rooms/photo-studio.jpg?${ICON_VERSION}`],
  },
  manifest: `/manifest.json?${ICON_VERSION}`,
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Snapforest" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
  verification: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION } : undefined,
  icons: {
    icon: [
      { url: `/favicon.ico?${ICON_VERSION}`, sizes: "48x48", type: "image/x-icon" },
      { url: `/favicon.png?${ICON_VERSION}`, sizes: "32x32", type: "image/png" },
      { url: `/icon-192.png?${ICON_VERSION}`, sizes: "192x192", type: "image/png" },
      { url: `/icon-512.png?${ICON_VERSION}`, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: `/apple-touch-icon.png?${ICON_VERSION}`, sizes: "180x180" }],
    shortcut: [`/favicon.ico?${ICON_VERSION}`],
  },
};

export const viewport: Viewport = { themeColor: "#0d0f0e", width: "device-width", initialScale: 1, maximumScale: 5 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable}`}>
      <head>
        <link rel="icon" href={`/favicon.ico?${ICON_VERSION}`} sizes="any" />
        <link rel="icon" href={`/favicon.png?${ICON_VERSION}`} type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href={`/apple-touch-icon.png?${ICON_VERSION}`} sizes="180x180" />
        <link rel="manifest" href={`/manifest.json?${ICON_VERSION}`} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Snapforest" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Snapforest" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="min-h-screen bg-[#0f0f0f] font-sans text-white antialiased">
        <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.018] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.28)_1px,transparent_0)] [background-size:32px_32px]" />
        <JsonLd />
        <AuthProvider>
          <ToastProvider>
            <ThemeProvider>
              <div className="relative z-10">
                <Navbar />
                <main className="min-h-screen">{children}</main>
                <Footer />
                <ChatBot />
                <PWAInstallPrompt />
              </div>
            </ThemeProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
