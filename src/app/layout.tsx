import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <div className="min-h-screen">{children}</div>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
