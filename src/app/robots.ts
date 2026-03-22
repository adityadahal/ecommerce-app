import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://freshmart.com.au";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/api/", "/account/", "/checkout/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
