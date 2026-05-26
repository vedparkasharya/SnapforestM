import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard - Manage Your Bookings",
  description:
    "Access your Snapforest dashboard to manage studio bookings, view past reservations, and update your profile. Snapforest by Ved Prakash Arya.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  // Client-side auth handled by AuthProvider
  return (
    <main className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your bookings and account settings.
        </p>
      </div>
    </main>
  );
}
