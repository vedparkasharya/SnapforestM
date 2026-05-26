import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login - Snapforest Dashboard",
  description: "Secure admin login for Snapforest studio management dashboard.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <p className="text-muted-foreground">Please login to access the admin dashboard.</p>
      </div>
    </main>
  );
}
