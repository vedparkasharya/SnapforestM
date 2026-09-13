import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://snapforest.in";
  const now = new Date();

  const routes = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${baseUrl}/rooms`, lastModified: now, changeFrequency: "daily" as const, priority: 0.9 },
  ];

  const categories = [
    "podcast", "youtube", "music", "photography", "gaming", "streaming", "meeting", "dance", "coworking",
  ];

  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/rooms?category=${category}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...routes, ...categoryRoutes];
}
