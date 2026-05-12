/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '/tmp/.next-snapforest',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  // ============================================================
  // PUBLIC ENVIRONMENT VARIABLES ONLY
  // NEVER put NEXTAUTH_SECRET here - it must remain server-only
  // The secret is now hardcoded in src/lib/auth.ts for consistency
  // ============================================================
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  },
};

export default nextConfig;
