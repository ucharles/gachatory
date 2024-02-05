import { MetadataRoute } from "next";

const BASE_URL = process.env.APP_SERVER_URL || "";
const SUPPORTED_LANGUAGES = ["en", "ko", "ja"]; // 지원하는 언어 코드

export default function sitemap(): MetadataRoute.Sitemap {
  let sitemaps: MetadataRoute.Sitemap = [];
  SUPPORTED_LANGUAGES.forEach((lng) => {
    const temp: MetadataRoute.Sitemap = [
      {
        url: `${BASE_URL}/${lng}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
      {
        url: `${BASE_URL}/${lng}/search`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
    ];
    sitemaps.push(...temp);
  });

  return sitemaps;
}
