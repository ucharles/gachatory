// 태그 구독 API 라우트
import dbConnect from "@/lib/db/db-connect";

import { NextResponse, NextRequest } from "next/server";
import { convertToObjectId } from "@/lib/db/convertObjectId";
import { ObjectId } from "bson";

import User from "@/lib/models/user-model";

import Notification from "@/lib/models/notification-model";

import { getUserIdWithCheckToken } from "@/lib/auth/checkUser";

export async function GET(request: NextRequest) {
  try {
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

    const notifications = await Notification.aggregate([
      {
        $match: {
          userId: objectUserId,
          confirmed: false,
        },
      },
      {
        $group: {
          _id: "$notificationId", // notificationId로 그룹화
          count: { $sum: 1 }, // 각 그룹의 문서 수 계산
        },
      },
    ]);

    const length = notifications.length;

    return NextResponse.json({ length }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
