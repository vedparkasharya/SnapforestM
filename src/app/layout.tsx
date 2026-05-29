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
  metadataBase: new URL("https://snapforest.in"),
  title: {
    default: "Snapforest - Creator Studio Booking | Podcast, YouTube, Gaming Rooms in Patna & Gaya",
    template: "%s | Snapforest - Creator Studio Booking",
  },
  description:
    "Snapforest by Ved Prakash Arya - Book premium podcast studios, YouTube setups, music rooms, photo studios, gaming rooms, interview rooms, and reel studios in Patna and Gaya, Bihar. Hourly and daily bookings with instant confirmation.",
  keywords: [
    // Brand & Founder
    "Snapforest",
    "Snapforest studio",
    "Ved Prakash Arya",
    "Ved Prakash Arya founder of Snapforest",
    "Ved Prakash Arya founder snapforest",
    "Snapforest founder",
    // Location-based Patna
    "creator studio Patna",
    "podcast studio Patna",
    "YouTube studio Patna",
    "music room Patna",
    "photo studio Patna",
    "gaming room Patna",
    "interview room Patna",
    "reel studio Patna",
    "studio booking Patna",
    "content creator studio Patna",
    // Location-based Gaya
    "creator studio Gaya",
    "podcast room in Gaya",
    "podcast studio Gaya Bihar",
    "interview room in Gaya",
    "reel studio Gaya",
    "reel studio Gaya Bihar",
    "gaming room in Gaya",
    "YouTube studio Gaya Bihar",
    "content creator studio Gaya",
    "studio booking Gaya",
    // Location-based Bihar
    "creator studio Bihar",
    "podcast studio Bihar",
    "YouTube studio Bihar",
    "studio booking Bihar",
    // Generic
    "creator studio",
    "podcast studio",
    "YouTube studio",
    "music room",
    "photo studio",
    "gaming room",
    "interview room",
    "reel studio",
    "recording studio",
    "live streaming studio",
    "coworking space",
    "content creation space",
    "creator space rental",
    "studio rental",
    "hourly studio booking",
    "booking",
    "Patna",
    "Gaya",
    "Bihar",
  ],
  authors: [{ name: "Ved Prakash Arya" }],
  creator: "Ved Prakash Arya",
  publisher: "Snapforest",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Snapforest - Creator Studio Booking | Podcast, YouTube, Gaming Rooms in Patna & Gaya",
    description: "Snapforest by Ved Prakash Arya - Book creator studios in Patna & Gaya - Podcast, YouTube, Music, Photo, Gaming, Interview & Reel Studios. Hourly and daily bookings.",
    url: "https://snapforest.in",
    siteName: "Snapforest",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Snapforest - Creator Studio Booking Platform by Ved Prakash Arya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Snapforest - Creator Studio Booking by Ved Prakash Arya",
    description: "Book premium podcast, YouTube, gaming, interview & reel studios in Patna & Gaya, Bihar. Hourly and daily bookings.",
    images: ["/icon-512x512.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Snapforest",
    startupImage: [
      {
        url: "/icon-512x512.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
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
  verification: {
    google: "your-google-verification-code",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  other: {
    "msapplication-TileImage": "/icon-192x192.png",
    "msapplication-TileColor": "#0f0f0f",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0f" },
    { media: "(prefers-color-scheme: light)", color: "#0f0f0f" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-192x192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
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

        {/* Service Worker Registration Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(registration) {
                        console.log('[PWA] Service Worker registered:', registration.scope);
                        
                        // Check for updates periodically
                        setInterval(function() {
                          registration.update();
                        }, 60 * 60 * 1000); // Check every hour
                      })
                      .catch(function(error) {
                        console.log('[PWA] Service Worker registration failed:', error);
                      });
                  });
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
