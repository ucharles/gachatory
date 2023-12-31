// /api/capsules/id
// GET /api/capsules/id

// Dynamic API routes
// https://nextjs.org/docs/pages/building-your-application/routing/api-routes#dynamic-api-routes

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/db-connect";
import { ObjectId } from "mongodb";
import CapsuleToy from "@/lib/models/capsule-model";
import Localization, { ILocalization } from "@/lib/models/localization-model";
import CapsuleTag, { ICapsuleTag } from "@/lib/models/capsule-tag-model";
import { dateTranslator } from "@/lib/date-converter";

const IMAGE_URI = process.env.IMAGE_SERVER_URL;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // DB 연결하기
    dbConnect();

    const queryParams = new URLSearchParams(new URL(request.url).search);
    const lng = queryParams.get("lng");

    // DB 검색하기
    const resultCapsules = await CapsuleToy.findById(
      new ObjectId(params.id)
    ).populate([
      {
        path: "localization",
        model: Localization,
      },
      {
        path: "tagId",
        model: CapsuleTag,
      },
    ]);

    let capsule = resultCapsules.toObject();
    capsule.date = capsule.date.map((date: string) => {
      return dateTranslator(date, lng);
    });
    capsule.localization?.forEach((language: ILocalization) => {
      if (language.lng === lng) {
        capsule.originalName = capsule.name;
        capsule.name = language.name;
        capsule.description = language.description;
        capsule.header = language.header;
      }
    });

    capsule.img = capsule.img
      ? IMAGE_URI + capsule.img
      : IMAGE_URI + "images/prepare.jpg";

    if (capsule.detail_img.length > 0) {
      capsule.detail_img = capsule.detail_img.map((img: string) => {
        return IMAGE_URI + img;
      });
    }

    // 결과 반환하기
    return NextResponse.json(capsule, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
  // else if (req.method === "POST") {
  //     try {
  //         dbConnect();
  //         // 모델 가져오기
  //         const data = req.body;
  //         const { title, content, date } = data;
  //     } catch (error) {
  //         console.error(error);
  //         res.status(500).json({ message: "Internal server error" });
  //     }
  // }
}
