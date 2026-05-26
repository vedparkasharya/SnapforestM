import type { MetadataRoute } from "next";

/**
 * robots.txt for Snapforest
 * Controls search engine crawler access
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://snapforestx.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/dashboard",
          "/_next/",
          "/*.json$",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin", "/api/", "/dashboard"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/rooms/", "/icon-"],
        disallow: ["/admin", "/api/", "/dashboard"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
