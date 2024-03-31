// using getToken: https://next-auth.js.org/tutorials/securing-pages-and-api-routes#using-gettoken
// JSON 웹 토큰을 사용하는 경우 getToken() 도우미를 사용하여 JWT 복호화/검증을 직접 처리하지 않고도 JWT의 콘텐츠에 액세스할 수 있습니다.
// 이 방법은 서버 측에서만 사용할 수 있습니다.

import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db/db-connect";

import { getToken } from "next-auth/jwt";
import Like from "@/lib/models/like-model";
import { convertToObjectId } from "@/lib/db/convertObjectId";
import CapsuleToy from "@/lib/models/capsule-model";
import Localization, { ILocalization } from "@/lib/models/localization-model";
import { ILike } from "@/lib/models/like-model";
import CapsuleTag from "@/lib/models/capsule-tag-model";
import { dateTranslator } from "@/lib/date-converter";
import { perPageEnum } from "@/lib/enums";
import { editLikes } from "../util-likes";

const IMAGE_SERVER_URL = process.env.IMAGE_SERVER_URL;

export async function GET(request: NextRequest) {
  // 유저 확인
  let token;
  try {
    token = await getToken({ req: request });
  } catch (error) {
    console.error("JWT Token Error: ", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
  let userId = token?.sub; // add null check for token

  if (!userId) {
    return NextResponse.next();
  }

  const params = new URLSearchParams(new URL(request.url).search);

  const lng = params.get("lng");
  const name = params.get("name");

  let locSearchName = "";
  if (name) {
    const escapedName = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    locSearchName = escapedName;
  }

  let currentPage = 1;
  const page = params.get("page");
  page ? (currentPage = +page) : null;

  let perPage = perPageEnum.SMALL;

  await dbConnect();

  // 좋아요 객체가 있는지 확인
  let likes: ILike[] = [];
  try {
    likes = await Like.find({
      userId: convertToObjectId(userId),
      state: true,
    })
      .sort({ updatedAt: -1 })
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

  const likeCapsuleIds = likes.map((like) => {
    return like.capsuleId;
  });

  // 일본어 검색
  let capsules;
  try {
    capsules = await CapsuleToy.find({
      _id: { $in: likeCapsuleIds },
      name: new RegExp(locSearchName as string, "i"),
      description: new RegExp(locSearchName as string, "i"),
    })
      .sort({ dateISO: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
  } catch (error) {
    console.error("Error finding like:", error);
    return NextResponse.next();
  }

  // 한국어, 영어 검색
  let locSearchCapsules: ILocalization[] = [];
  try {
    locSearchCapsules = await Localization.find({
      capsuleId: { $in: likeCapsuleIds },
      $or: [
        { name: new RegExp(locSearchName as string, "i") },
        { description: new RegExp(locSearchName as string, "i") },
      ],
    })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
  } catch (error) {
    console.error("Error finding like:", error);
    return NextResponse.next();
  }

  if (capsules.length === 0 && locSearchCapsules.length === 0) {
    return NextResponse.json(
      {
        likes: [],
      },
      { status: 200 },
    );
  }

  const capsuleIds = capsules.map((capsule) => {
    return capsule._id;
  });

  const locSearchCapsuleIds = locSearchCapsules.map((capsule) => {
    return capsule.capsuleId;
  });

  // capsuleIds, locSearchCapsuleIds 합치기
  // 중복 제외
  const allCapsuleIds = Array.from(
    new Set([...capsuleIds, ...locSearchCapsuleIds]),
  );

  likes = likes.filter((like) => {
    return allCapsuleIds.includes(like.capsuleId._id);
  });

  // 캡슐 정보 편집
  likes = editLikes(likes, lng);

  return NextResponse.json(
    {
      likes,
    },
    { status: 200 },
  );
}
