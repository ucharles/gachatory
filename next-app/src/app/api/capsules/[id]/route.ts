// /api/capsules/id
// GET /api/capsules/id

// Dynamic API routes
// https://nextjs.org/docs/pages/building-your-application/routing/api-routes#dynamic-api-routes

import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db/db-connect";
import mongoose from "mongoose";
import CapsuleToy from "@/lib/models/capsule-model";
import Localization, { ILocalization } from "@/lib/models/localization-model";
import CapsuleTag, { ICapsuleTag } from "@/lib/models/capsule-tag-model";
import { dateTranslator } from "@/lib/date-converter";
import { getToken } from "next-auth/jwt";
import { convertToObjectId } from "@/lib/db/convertObjectId";
import Like, { ILike } from "@/lib/models/like-model";

const IMAGE_URI = process.env.IMAGE_SERVER_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // DB 연결하기
    dbConnect();

    const queryParams = new URLSearchParams(new URL(request.url).search);
    const lng = queryParams.get("lng");

    // DB 검색하기
    const resultCapsules = await CapsuleToy.findById(
      new mongoose.Types.ObjectId(params.id),
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

    // JWT 토큰에서 유저 정보 가져오기
    let token;
    try {
      token = await getToken({ req: request });
    } catch (error) {
      console.error("JWT Token Error: ", error);
      return NextResponse.json({
        status: 500,
        message: "Internal Server Error",
      });
    }

    if (token) {
      const userId = token?.sub; // add null check for token

      if (!userId) {
        return NextResponse.next();
      }

      const userIdObj = convertToObjectId(userId);
      const capsuleIdObj = convertToObjectId(params.id);

      // 이미 좋아요를 눌렀는지 확인하기
      let like;
      try {
        like = await Like.findOne({
          userId: userIdObj,
          capsuleId: capsuleIdObj,
          state: true,
        });
      } catch (error) {
        console.error("Error finding like:", error);
        return NextResponse.next();
      }

      if (like) {
        capsule.like = true;
      } else {
        capsule.like = false;
      }
    }

    // 결과 반환하기
    return NextResponse.json(capsule, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
