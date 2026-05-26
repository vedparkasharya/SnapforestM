import type { Metadata } from "next";
import RoomList from "@/components/rooms/RoomList";

/**
 * SEO Metadata for Rooms Page
 * Targets: studio booking, podcast room, gaming room, interview room, reel studio in Patna and Gaya
 */
export const metadata: Metadata = {
  title: "Browse Studios - Podcast, YouTube, Gaming, Music, Photo Studios",
  description:
    "Browse and book professional creator studios in Patna and Gaya, Bihar. Podcast studios, YouTube setups, music rooms, photo studios, gaming rooms, interview rooms, and reel studios. Hourly and daily rates available.",
  keywords: [
    "browse studios Patna",
    "browse studios Gaya",
    "studio booking Patna",
    "studio booking Gaya",
    "podcast room in Gaya",
    "podcast studio Patna Bihar",
    "YouTube studio Patna",
    "YouTube studio Gaya",
    "gaming room in Gaya",
    "gaming room Patna",
    "interview room in Gaya",
    "interview room Patna",
    "reel studio Gaya Bihar",
    "reel studio Patna",
    "music room Patna",
    "photo studio Patna",
    "creator studios Bihar",
    "book studio online Patna",
    "book studio online Gaya",
  ],
  openGraph: {
    title: "Browse Creator Studios - Snapforest | Patna & Gaya",
    description:
      "Discover 8+ professional creator studios in Patna and Gaya. Podcast, YouTube, Gaming, Music, Photo, Interview & Reel studios. Book by the hour or day.",
    type: "website",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Snapforest Creator Studios - Browse rooms in Patna and Gaya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Creator Studios - Snapforest | Patna & Gaya",
    description:
      "Discover 8+ professional creator studios in Patna and Gaya. Podcast, YouTube, Gaming, Music, Photo, Interview & Reel studios.",
    images: ["/icon-512x512.png"],
  },
  alternates: {
    canonical: "/rooms",
  },
};

export default function RoomsPage() {
  return (
    <main className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Browse <span className="text-neon-cyan">Studios</span>
        </h1>
        <p className="text-muted-foreground mb-8">
          Find and book the perfect creator space in Patna and Gaya, Bihar
        </p>
      </div>
      <RoomList />
    </main>
  );
}
