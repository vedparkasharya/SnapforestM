"use client";

import Script from "next/script";

/**
 * JSON-LD Structured Data for LocalBusiness SEO
 * Helps search engines understand Snapforest as a local business
 * Founder: Ved Prakash Arya
 * Locations: Patna and Gaya, Bihar
 */
export function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://snapforestx.com/#organization",
        name: "Snapforest",
        alternateName: "Snapforest Creator Studios",
        url: "https://snapforestx.com",
        logo: {
          "@type": "ImageObject",
          url: "https://snapforestx.com/icon-512x512.png",
          width: 512,
          height: 512,
        },
        founder: {
          "@type": "Person",
          name: "Ved Prakash Arya",
          description:
            "Founder of Snapforest - Creator studio booking platform in Bihar",
          jobTitle: "Founder & CEO",
          worksFor: {
            "@id": "https://snapforestx.com/#organization",
          },
        },
        sameAs: [
          "https://instagram.com/snapforestx",
          "https://twitter.com/snapforestx",
          "https://youtube.com/@snapforestx",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+91-98765-43210",
          contactType: "customer service",
          availableLanguage: ["English", "Hindi"],
          areaServed: ["Patna", "Gaya", "Bihar"],
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://snapforestx.com/#website",
        url: "https://snapforestx.com",
        name: "Snapforest - Creator Studio Booking",
        description:
          "Book premium podcast studios, YouTube setups, music rooms, photo studios, gaming rooms, interview rooms, and reel studios in Patna and Gaya, Bihar.",
        publisher: {
          "@id": "https://snapforestx.com/#organization",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://snapforestx.com/rooms?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://snapforestx.com/#localbusiness-patna",
        name: "Snapforest - Patna",
        description:
          "Premium creator studio rentals in Patna. Podcast studios, YouTube studios, music rooms, photo studios, gaming rooms, interview rooms, and reel studios available for hourly and daily booking.",
        url: "https://snapforestx.com",
        telephone: "+91-98765-43210",
        email: "hello@snapforestx.com",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Boring Road",
          addressLocality: "Patna",
          addressRegion: "Bihar",
          postalCode: "800001",
          addressCountry: "IN",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: "25.5941",
          longitude: "85.1376",
        },
        areaServed: [
          {
            "@type": "City",
            name: "Patna",
          },
          {
            "@type": "City",
            name: "Gaya",
          },
          {
            "@type": "AdministrativeArea",
            name: "Bihar",
          },
        ],
        priceRange: "$$",
        currenciesAccepted: "INR",
        paymentAccepted: "Cash, Credit Card, UPI, Online Payment",
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "00:00",
            closes: "23:59",
          },
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Creator Studio Services",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Podcast Studio Rental",
                description:
                  "Professional podcast studio with microphones, mixer, and acoustic treatment. Available in Patna and Gaya.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "YouTube Studio Rental",
                description:
                  "YouTube studio with cameras, lighting, green screen, and teleprompter. Available in Patna and Gaya.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Music Room Rental",
                description:
                  "Music recording room with instruments, microphones, and soundproofing. Available in Patna.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Photo Studio Rental",
                description:
                  "Professional photo studio with backdrop, lighting, and camera equipment. Available in Patna.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Gaming Room Rental",
                description:
                  "Gaming room with high-end PCs, consoles, streaming setup, and RGB lighting. Available in Patna and Gaya.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Interview Room Rental",
                description:
                  "Interview room with professional lighting, cameras, and quiet environment. Available in Patna and Gaya.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Reel Studio Rental",
                description:
                  "Reel studio optimized for short-form content creation with ring lights and phone mounts. Available in Patna and Gaya.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Coworking Space Rental",
                description:
                  "Coworking space with high-speed internet, desks, and meeting rooms. Available in Patna.",
              },
            },
          ],
        },
      },
    ],
  };

  return (
    <Script
      id="json-ld-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
