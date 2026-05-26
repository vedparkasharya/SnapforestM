import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - Manage Rooms & Bookings",
  description:
    "Snapforest admin dashboard for managing creator studios, rooms, bookings, and analytics. Built by Ved Prakash Arya.",
  robots: {
    index: false,
    follow: false,
  },
};

// Client component imports handled via separate file
import AdminClientPage from "./AdminClientPage";

export default function AdminPage() {
  return <AdminClientPage />;
}
