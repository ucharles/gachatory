// using getToken: https://next-auth.js.org/tutorials/securing-pages-and-api-routes#using-gettoken
// JSON 웹 토큰을 사용하는 경우 getToken() 도우미를 사용하여 JWT 복호화/검증을 직접 처리하지 않고도 JWT의 콘텐츠에 액세스할 수 있습니다.
// 이 방법은 서버 측에서만 사용할 수 있습니다.

import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import Like from "@/lib/models/like-model";
import { convertToObjectId } from "@/lib/db/convertObjectId";
import CapsuleToy from "@/lib/models/capsule-model";
import Localization, { ILocalization } from "@/lib/models/localization-model";
import CapsuleTag from "@/lib/models/capsule-tag-model";
import { dateTranslator } from "@/lib/date-converter";

const IMAGE_SERVER_URL = process.env.IMAGE_SERVER_URL;

export async function GET(request: NextRequest) {
  // 유저 확인
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
  let userId = token?.sub; // add null check for token

  if (!userId) {
    return NextResponse.next();
  }

  const params = new URLSearchParams(new URL(request.url).search);

  const limit = params.get("limit");
  const lng = params.get("lng");
  const name = params.get("name");

  let locSearchName = "";
  if (name) {
    const escapedName = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    locSearchName = escapedName;
  }

  let perPage = 4;

  if (limit) {
    perPage = +limit || 4;
    if (perPage >= 20) {
      perPage = 20;
    }
  }

  // 좋아요 객체가 있는지 확인
  let likes;
  try {
    likes = await Like.find({
      userId: convertToObjectId(userId),
      state: true,
    })
      .sort({ updatedAt: -1 })
      .limit(perPage)
      .populate({
        path: "capsuleId",
        model: CapsuleToy,
        populate: [
          {
            path: "localization",
            model: Localization,
          },
          {
            path: "tagId",
            model: CapsuleTag,
          },
        ],
      });
  } catch (error) {
    console.error("Error finding like:", error);
    return NextResponse.next();
  }

  // 캡슐 정보 편집
  likes = likes.map((like) => {
    const plainLike = like.toObject(); // convert Mongoose document to plain JavaScript object

    if (
      plainLike.capsuleId.img === "" &&
      plainLike.capsuleId.detail_img.length !== 0
    ) {
      plainLike.capsuleId.display_img = `${IMAGE_SERVER_URL}${plainLike.capsuleId.detail_img[0]}`;
    } else {
      plainLike.capsuleId.display_img = `${IMAGE_SERVER_URL}${plainLike.capsuleId.img}`;
    }
    plainLike.capsuleId.date = plainLike.capsuleId.date?.map((date: string) => {
      return dateTranslator(date, lng);
    });
    plainLike.capsuleId.localization?.forEach((language: ILocalization) => {
      if (language.lng === lng) {
        plainLike.capsuleId.name = language.name;
        plainLike.capsuleId.description = language.description;
        plainLike.capsuleId.header = language.header;
      }
    });
    delete plainLike.capsuleId.localization;
    return plainLike;
  });

  return NextResponse.json({
    status: 200,
    likes,
  });
}
