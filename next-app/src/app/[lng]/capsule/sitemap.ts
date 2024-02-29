import { MetadataRoute } from "next";
import CapsuleToy from "@/lib/models/capsule-model";
import dbConnect from "@/lib/db/db-connect";

const BASE_URL = process.env.APP_SERVER_URL || "";
const SUPPORTED_LANGUAGES = ["en", "ko", "ja"]; // 지원하는 언어 코드

export async function generateSitemaps(): Promise<Array<{ id: number }>> {
  await dbConnect();
  // const count = await CapsuleToy.countDocuments();
  // const sitemapsPerLanguage = Math.ceil(count / 50000);

  let sitemaps: Array<{ id: number }> = [];
  // 언어 수 *
  for (let i = 0; i < SUPPORTED_LANGUAGES.length; i++) {
    sitemaps.push({ id: i }); // 'path'에 lng와 id를 결합하여 저장
  }

  console.log("Generate Capsule Toy Sitemaps...", sitemaps);

  return sitemaps;
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  await dbConnect();

  console.log("id", id);

  // id는 캡슐 토이의 문서 수 / 50000 * 언어 수

  const limit = 50000;

  // 제목에 특정 단어가 들어가는 캡슐 토이는 제외해야 함
  const products = await CapsuleToy.find({
    name: new RegExp("^((?!箱売).)*$", "i"),
  })
    .limit(limit)
    .sort({ _id: 1 });

  return products.map((capsule) => ({
    url: `${BASE_URL}/${SUPPORTED_LANGUAGES[id]}/capsule/${capsule._id}`,
    lastModified: capsule.updatedAt,
  }));
}
