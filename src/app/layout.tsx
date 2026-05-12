import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "SnapforestX - Creator Studio Booking Platform",
  description: "Book professional creator studios, podcast rooms, gaming setups, YouTube studios, and more. India's first creator-focused studio booking platform.",
  keywords: "creator studio, podcast studio, gaming room, YouTube studio, content creation, booking platform, Patna",
  openGraph: {
    title: "SnapforestX - Creator Studio Booking",
    description: "Book professional creator studios near you",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
