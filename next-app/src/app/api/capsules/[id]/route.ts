// /api/capsules/id
// GET /api/capsules/id

// Dynamic API routes
// https://nextjs.org/docs/pages/building-your-application/routing/api-routes#dynamic-api-routes

import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db/db-connect";
import mongoose from "mongoose";
import CapsuleToy from "@/lib/models/capsule-model";
import Localization, { ILocalization } from "@/lib/models/localization-model";
import CapsuleTag, {
  ICapsuleTag,
  ICapsuleTagSubscription,
} from "@/lib/models/capsule-tag-model";
import { dateTranslator } from "@/lib/date-converter";
import { getToken } from "next-auth/jwt";
import { convertToObjectId } from "@/lib/db/convertObjectId";
import Like, { ILike } from "@/lib/models/like-model";
import SubscriptionTag, {
  ISubscriptionTag,
} from "@/lib/models/subscription-tag-model";

import { getUserIdWithCheckToken } from "@/lib/auth/checkUser";
import { ObjectId } from "bson";

import { validateLng } from "@/lib/validation";

const IMAGE_URI = process.env.IMAGE_SERVER_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // DB 연결하기
    dbConnect();

    const queryParams = new URLSearchParams(new URL(request.url).search);
    const lng = validateLng(queryParams.get("lng"));

    if (ObjectId.isValid(params.id) === false) {
      return NextResponse.json(
        {
          message: "Invalid capsuleId",
        },
        { status: 400 },
      );
    }

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

    // 세션 정보 확인
    const sessionResult = await getUserIdWithCheckToken(request);

    // 결과가 NextResponse 객체인지 확인합니다.
    if (sessionResult instanceof NextResponse) {
      // NextResponse 객체를 반환하면 라우트 핸들러의 실행을 종료합니다.
      return NextResponse.json(capsule, { status: 200 });
    }

    // 이 시점에서, result는 userId의 문자열입니다.
    const userId: string = sessionResult;

    if (ObjectId.isValid(userId) === false) {
      return NextResponse.json(
        {
          message: "Invalid userId",
        },
        { status: 400 },
      );
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

    // 캡슐에서 사용된 태그 목록 가져오기
    const tags = capsule.tagId.map((tag: ICapsuleTag) => {
      return tag._id;
    });

    // 구독한 태그 목록 가져오기
    const subscriptionTags: ISubscriptionTag[] | null =
      await SubscriptionTag.find({
        userId: userIdObj,
        tagId: { $in: tags },
        state: true,
      });

    if (subscriptionTags.length === 0) {
      return NextResponse.json(capsule, { status: 200 });
    }

    capsule.tagId.map((tag: ICapsuleTagSubscription) => {
      const tagId = tag._id;
      const subscriptionTag = subscriptionTags.find(
        (subscriptionTag) =>
          subscriptionTag.tagId.toString() === tagId.toString(),
      );

      if (subscriptionTag) {
        tag.subscription = true;
      } else {
        tag.subscription = false;
      }
    });

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
