import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: ["/*/search", "/*/like-list", "/*/user", "/api"],
    },
    sitemap: [
      "https://gachatory.com/sitemap.xml",
      "https://gachatory.com/ko/capsule/sitemap/0.xml",
      "https://gachatory.com/ko/capsule/sitemap/1.xml",
      "https://gachatory.com/ko/capsule/sitemap/2.xml",
    ],
  };
}
