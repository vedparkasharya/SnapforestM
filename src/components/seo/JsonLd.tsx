import Script from "next/script";

/**
 * Structured data for Snapforest.
 * Keep this limited to facts the application can actually support; invented
 * phone numbers, addresses, opening hours and review counts hurt trust and SEO.
 */
export function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://snapforest.in/#organization",
        name: "Snapforest",
        alternateName: "Snapforest Creator Studios",
        url: "https://snapforest.in",
        logo: "https://snapforest.in/icon-512.png",
        founder: {
          "@type": "Person",
          name: "Ved Prakash Arya",
        },
        areaServed: {
          "@type": "City",
          name: "Patna",
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://snapforest.in/#website",
        url: "https://snapforest.in",
        name: "Snapforest - Creator Studio Booking",
        description: "Find and book creator spaces in Patna, Bihar.",
        publisher: { "@id": "https://snapforest.in/#organization" },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://snapforest.in/rooms?search={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <Script
      id="json-ld-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
