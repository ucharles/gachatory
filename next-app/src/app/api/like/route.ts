// using getToken: https://next-auth.js.org/tutorials/securing-pages-and-api-routes#using-gettoken
// JSON 웹 토큰을 사용하는 경우 getToken() 도우미를 사용하여 JWT 복호화/검증을 직접 처리하지 않고도 JWT의 콘텐츠에 액세스할 수 있습니다.
// 이 방법은 서버 측에서만 사용할 수 있습니다.

import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import Like, { ILike } from "@/lib/models/like-model";
import { ICapsuleToy } from "@/lib/models/capsule-model";
import { convertToObjectId } from "@/lib/db/convertObjectId";
import CapsuleToy from "@/lib/models/capsule-model";
import Localization, { ILocalization } from "@/lib/models/localization-model";
import CapsuleTag from "@/lib/models/capsule-tag-model";
import { dateTranslator } from "@/lib/date-converter";
import { editLikes, sortLikes } from "./util-likes";

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
  const page = params.get("page");
  const paramSortBy = params.get("sortBy") || "like";
  const paramSortOrder = params.get("sortOrder") || "desc";

  // 유효성 검사

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

  let currentPage = 1;

  if (page) {
    currentPage = +page < 0 ? 1 : +page;
  }

  let sortBy = "like";
  let sortOrder = "desc";

  if (paramSortBy === "like" || paramSortBy === "release") {
    sortBy = paramSortBy;
  }

  if (paramSortOrder === "desc" || paramSortOrder === "asc") {
    sortOrder = paramSortOrder;
  }

  let totalLikes = 0;

  try {
    totalLikes = await Like.countDocuments({
      userId: convertToObjectId(userId),
      state: true,
    });
  } catch (error) {
    console.error("Error counting like:", error);
    return NextResponse.next();
  }

  if (totalLikes === 0) {
    return NextResponse.json({});
  }

  // 최대 페이지 계산 후 현재 페이지가 최대 페이지보다 크다면 최대 페이지로 설정

  const maxPage = Math.ceil(totalLikes / perPage);

  if (maxPage !== 0 && currentPage > maxPage) {
    currentPage = maxPage;
  }

  // 좋아요 객체가 있는지 확인
  let likes: ILike[] = [];

  try {
    likes = await Like.find({
      userId: convertToObjectId(userId),
      state: true,
    })
      .skip((currentPage - 1) * perPage)
      .sort({
        updatedAt: sortBy === "like" ? (sortOrder === "asc" ? 1 : -1) : -1,
      })
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

  // 검색어가 없다면 전체 좋아요 캡슐 반환

  if (locSearchName.length === 0) {
    console.log("locSearchName.length === 0", locSearchName);
    // 캡슐 정보 편집
    likes = editLikes(likes, lng);

    return NextResponse.json({
      totalCount: totalLikes,
      likes,
      page: +currentPage,
    });
  }

  // 이후 검색어가 있다면 검색어에 따라 좋아요 캡슐 반환
  console.log("locSearchName.length !== 0", locSearchName);

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
      .sort({
        dateISO: sortBy === "release" ? (sortOrder === "asc" ? 1 : -1) : -1,
      })
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
    return NextResponse.json({
      status: 200,
      likes: [],
    });
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

  return NextResponse.json({
    totalCount: totalLikes,
    likes,
    page: +currentPage,
  });
}

export async function POST(request: NextRequest) {
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
  let userId = token?.sub; // add null check for token

  if (!userId) {
    return NextResponse.next();
  }

  const body = await request.json();
  const { capsuleId } = body;
  console.log("capsuleId:", capsuleId);

  // token에서 유저 ID 가져오기

  const userIdObj = convertToObjectId(userId);
  const capsuleIdObj = convertToObjectId(capsuleId);

  // 좋아요 객체가 있는지 확인
  let like;
  try {
    like = await Like.findOne({
      userId: userIdObj,
      capsuleId: capsuleIdObj,
    });
  } catch (error) {
    console.error("Error finding like:", error);
    return NextResponse.next();
  }

  // 좋아요 객체가 없다면 true로 캡슐 좋아요 생성하기
  if (!like) {
    try {
      await Like.create({
        userId: userIdObj,
        capsuleId: capsuleIdObj,
        state: true,
      });
      return NextResponse.json({ status: 200, like: true });
    } catch (error) {
      console.error("Error creating like:", error);
      return NextResponse.next();
    }
  }
  // 좋아요 객체가 있다면 state를 반대로 업데이트하기
  else if (like) {
    try {
      await Like.updateOne(
        {
          userId: userIdObj,
          capsuleId: capsuleIdObj,
        },
        { state: like.state ? false : true },
      );
      return NextResponse.json({
        status: 200,
        like: like.state ? false : true,
      });
    } catch (error) {
      console.error("Error update like: ", error);
      return NextResponse.next();
    }
  } else {
    return NextResponse.next();
  }
}
