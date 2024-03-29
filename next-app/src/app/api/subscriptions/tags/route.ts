// 태그 구독 API 라우트
import dbConnect from "@/lib/db/db-connect";

import { NextResponse, NextRequest } from "next/server";
import Like, { ILike } from "@/lib/models/like-model";
import { convertToObjectId } from "@/lib/db/convertObjectId";
import CapsuleToy, { ICapsuleToy } from "@/lib/models/capsule-model";
import Localization, { ILocalization } from "@/lib/models/localization-model";
import CapsuleTag, { ICapsuleTag } from "@/lib/models/capsule-tag-model";
import { dateTranslator } from "@/lib/date-converter";
import { ObjectId } from "bson";

import SubscriptionTag, {
  ISubscriptionTag,
} from "@/lib/models/subscription-tag-model";
import User from "@/lib/models/user-model";

import { getUserIdWithCheckToken } from "@/lib/auth/checkUser";

// route 안에서 middleware를 사용할 수는 없나?

export async function GET(request: NextRequest) {
  const sessionResult = await getUserIdWithCheckToken(request);

  // 결과가 NextResponse 객체인지 확인합니다.
  if (sessionResult instanceof NextResponse) {
    // NextResponse 객체를 반환하면 라우트 핸들러의 실행을 종료합니다.
    return sessionResult;
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

  await dbConnect();

  const objectUserId = convertToObjectId(userId);

  // userId 확인
  const user = await User.findById(objectUserId);

  if (!user) {
    return NextResponse.json(
      {
        message: "User not found",
      },
      { status: 400 },
    );
  }

  // 구독한 태그 목록 가져오기
  const subscriptionTags: ISubscriptionTag[] | null =
    await SubscriptionTag.find({
      userId: objectUserId,
      state: true,
    }).populate("tagId");

  // 태그 목록이 없는 경우
  if (subscriptionTags.length === 0) {
    return NextResponse.json(
      {
        message: "No subscribed tags",
      },
      { status: 200 },
    );
  }

  const resultTags: any[] = [];

  subscriptionTags.map((tag) => {
    const tagInfo = tag.tagId as ICapsuleTag;
    const element = {
      tagId: tagInfo._id,
      subscriptionId: tag._id,
      ja: tagInfo.ja[0],
      ko: tagInfo.ko[0],
      en: tagInfo.en[0],
      property: tagInfo.property,
      linkCount: tagInfo.linkCount,
      tagCreatedAt: tagInfo.createdAt,
      subscribedAt: tag.updatedAt,
    };
    resultTags.push(element);
  });

  // 모든 검사를 통과했다면, 최종 응답을 반환합니다.
  return NextResponse.json(resultTags, { status: 200 });
}

export async function POST(request: NextRequest) {
  const tokenResult = await getUserIdWithCheckToken(request);

  // 결과가 NextResponse 객체인지 확인합니다.
  if (tokenResult instanceof NextResponse) {
    // NextResponse 객체를 반환하면 라우트 핸들러의 실행을 종료합니다.
    return tokenResult;
  }

  // 이 시점에서, result는 userId의 문자열입니다.
  const userId = tokenResult;

  if (ObjectId.isValid(userId) === false) {
    return NextResponse.json(
      {
        message: "Invalid userId",
      },
      { status: 400 },
    );
  }

  const body = await request.json();
  const { tagId } = body;

  if (!tagId) {
    return NextResponse.json(
      {
        message: "tagId is required",
      },
      { status: 400 },
    );
  }

  if (typeof tagId !== "string") {
    return NextResponse.json(
      {
        message: "Invalid tagId",
      },
      { status: 400 },
    );
  }

  if (ObjectId.isValid(tagId) === false) {
    return NextResponse.json(
      {
        message: "Invalid tagId",
      },
      { status: 400 },
    );
  }

  await dbConnect();

  // userId와 tagId를 ObjectId로 변환합니다.
  // 이 과정이 없을 경우 검색 불가
  const objectUserId = convertToObjectId(userId);
  const objectTagId = convertToObjectId(tagId);

  // userId 확인
  const user = await User.findById(objectUserId);

  if (!user) {
    return NextResponse.json(
      {
        message: "User not found",
      },
      { status: 400 },
    );
  }

  // tagId 확인
  const tag = await CapsuleTag.findById(objectTagId);

  if (!tag) {
    return NextResponse.json(
      {
        message: "Tag not found",
      },
      { status: 400 },
    );
  }

  // 이미 태그를 구독중인지 확인
  const existSubscription: ISubscriptionTag | null =
    await SubscriptionTag.findOne({
      userId: objectUserId,
      tagId: objectTagId,
    });

  if (existSubscription?.state === true) {
    return NextResponse.json(
      {
        message: "Already subscribed tag",
      },
      { status: 400 },
    );
  }

  const subscriptionCount = await SubscriptionTag.countDocuments({
    userId: objectUserId,
    state: true,
  });

  // 구독 가능한 태그 수는 10개로 제한
  if (subscriptionCount >= 10) {
    return NextResponse.json(
      {
        message: "Subscription limit exceeded",
      },
      { status: 400 },
    );
  }

  // state가 false인 경우, state를 true로 변경
  if (existSubscription?.state === false) {
    await SubscriptionTag.updateOne(
      { userId: objectUserId, tagId: objectTagId },
      { state: true },
    );

    return NextResponse.json(
      {
        tagId,
      },
      { status: 200 },
    );
  }

  // Subscription Tag에 도큐먼트가 존재하지 않는 경우는 추가
  await SubscriptionTag.create({
    userId: objectUserId,
    tagId: objectTagId,
    state: true,
  });

  return NextResponse.json(
    {
      tagId,
    },
    { status: 200 },
  );
}
