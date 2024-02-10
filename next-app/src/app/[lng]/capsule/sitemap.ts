import { MetadataRoute } from "next";
import CapsuleToy from "@/lib/models/capsule-model";
import dbConnect from "@/lib/db/db-connect";

const BASE_URL = process.env.APP_SERVER_URL || "";
const SUPPORTED_LANGUAGES = ["en", "ko", "ja"]; // 지원하는 언어 코드

export async function generateSitemaps(): Promise<Array<{ id: string }>> {
  await dbConnect();
  const count = await CapsuleToy.countDocuments();
  const sitemapsPerLanguage = Math.ceil(count / 50000);

  let sitemaps: Array<{ id: string }> = [];
  // 언어 수 *
  SUPPORTED_LANGUAGES.forEach((lng) => {
    for (let i = 0; i < sitemapsPerLanguage; i++) {
      sitemaps.push({ id: `${lng}${i}` }); // 'path'에 lng와 id를 결합하여 저장
    }
  });

  return sitemaps;
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  await dbConnect();

  // 'path'에서 lng와 id를 추출, 0~1번째 인덱스: lng, 2번째 인덱스부터: id

  const lng = id.slice(0, 2);
  const ids = Number(id.slice(2));
  const limit = 50000;
  const skip = ids * limit;
  const products = await CapsuleToy.find({})
    .skip(skip)
    .limit(limit)
    .sort({ _id: 1 });

  return products.map((capsule) => ({
    url: `${BASE_URL}/${lng}/capsule/${capsule._id}`,
    lastModified: capsule.updatedAt,
  }));
}
