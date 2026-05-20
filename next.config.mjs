/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicit output directory - CRITICAL for Vercel builds
  distDir: ".next",

  images: {
    domains: [
      "lh3.googleusercontent.com",
      "res.cloudinary.com",
      "images.unsplash.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
  },
  trailingSlash: false,
  poweredByHeader: false,

  // Enable static export for PWA assets
  // This ensures sw.js and manifest.json are served from public directory
  async headers() {
    return [
      {
        // Service Worker headers - required for PWA installation
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        // Manifest.json headers
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
        ],
      },
      {
        // PWA icons headers
        source: "/icon-:size*.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, immutable",
          },
        ],
      },
    ];
  },

  // Rewrites to handle API routes properly
  async rewrites() {
    return [];
  },
};

export default nextConfig;
