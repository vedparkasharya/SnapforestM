import type { MetadataRoute } from "next";

/**
 * Dynamic sitemap for Snapforest
 * Helps search engines discover all pages
 * Founder: Ved Prakash Arya
 * Locations: Patna, Gaya, Bihar
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://snapforest.in";

  // Core pages
  const routes = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/rooms`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/admin/login`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  // Studio category pages - optimized for location-based SEO
  const studioCategories = [
    "podcast",
    "youtube",
    "music",
    "photography",
    "gaming",
    "streaming",
    "meeting",
    "dance",
    "coworking",
  ];

  const categoryRoutes = studioCategories.map((category) => ({
    url: `${baseUrl}/rooms?category=${category}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Location-based pages for SEO - targeting Gaya and Patna
  const locations = [
    { city: "patna", priority: 0.8 },
    { city: "gaya", priority: 0.8 },
  ];

  const locationRoutes = locations.map((loc) => ({
    url: `${baseUrl}/rooms?city=${loc.city}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: loc.priority,
  }));

  return [...routes, ...categoryRoutes, ...locationRoutes];
}
