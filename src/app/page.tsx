import type { Metadata } from "next";
import PremiumHome from "@/components/rooms/PremiumHome";
import "@/styles/premium-home.css";

export const metadata: Metadata = {
  title: "Snapforest | Creator Studio & Internship Programme",
  description: "Explore Snapforest creator services and apply for the Snapforest internship programme.",
};

export default function Home() {
  return <PremiumHome />;
}
