import type { Metadata } from "next";
import RoomList from "@/components/rooms/RoomList";

export const metadata: Metadata = {
  title: "Browse Studios | Snapforest",
  description:
    "Browse creator studios in Patna, Bihar. Compare room types, equipment, capacity and available booking options before you reserve.",
  keywords: [
    "studio booking Patna",
    "podcast studio Patna",
    "YouTube studio Patna",
    "gaming room Patna",
    "music room Patna",
    "photo studio Patna",
    "creator studios Bihar",
    "book studio online Patna",
  ],
  openGraph: {
    title: "Browse Creator Studios | Snapforest",
    description:
      "Find a creator space in Patna and compare the details that matter before booking.",
    type: "website",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Snapforest creator studios",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Creator Studios | Snapforest",
    description: "Find a creator space in Patna and compare rooms before booking.",
    images: ["/icon-512x512.png"],
  },
  alternates: { canonical: "/rooms" },
};

export default function RoomsPage() {
  return (
    <main className="min-h-screen pt-20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="sf-label mb-3">PATNA, BIHAR</p>
        <h1 className="mb-2 text-3xl font-bold sm:text-4xl">
          Find a studio that fits.
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Compare creator spaces, equipment, capacity and live room details before choosing your slot.
        </p>
      </div>
      <RoomList />
    </main>
  );
}
