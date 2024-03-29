import dbConnect from "@/lib/db/db-connect";

import { NextResponse, NextRequest } from "next/server";
import { convertToObjectId } from "@/lib/db/convertObjectId";
import CapsuleTag from "@/lib/models/capsule-tag-model";
import Notification from "@/lib/models/notification-model";
import { ObjectId } from "bson";

import SubscriptionTag, {
  ISubscriptionTag,
} from "@/lib/models/subscription-tag-model";
import User from "@/lib/models/user-model";

import { getUserIdWithCheckToken } from "@/lib/auth/checkUser";

// /api/subscriptions/tags/[tagId]/unsubscribe
// 구독 태그 취소
// 이미 구독 취소한 경우에는 tagId와 200을 반환합니다.
export async function PUT(
  request: NextRequest,
  { params }: { params: { notificationId: string } },
) {
  const notificationId = params.notificationId;

  if (!notificationId) {
    return NextResponse.json(
      {
        message: "notificationId is required",
      },
      { status: 400 },
    );
  }

  if (ObjectId.isValid(notificationId) === false) {
    return NextResponse.json(
      {
        message: "Invalid notificationId",
      },
      { status: 400 },
    );
  }

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

  await dbConnect();

  // userId와 tagId를 ObjectId로 변환합니다.
  // 이 과정이 없을 경우 검색 불가
  const objectUserId = convertToObjectId(userId);
  const objectNotificationId = convertToObjectId(notificationId);

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
  const notification = await Notification.find({
    notificationId: objectNotificationId,
  });

  if (!notification) {
    return NextResponse.json(
      {
        message: "Notification not found",
      },
      { status: 400 },
    );
  }

  try {
    await Notification.updateMany(
      { userId: objectUserId, notificationId: objectNotificationId },
      { confirmed: true },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Failed to update subscription tag",
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      notificationId,
    },
    { status: 200 },
  );
}
