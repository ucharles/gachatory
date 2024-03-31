// 태그 구독 API 라우트
import dbConnect from "@/lib/db/db-connect";

import { NextResponse, NextRequest } from "next/server";
import { convertToObjectId } from "@/lib/db/convertObjectId";
import { dateTranslator } from "@/lib/date-converter";
import { ObjectId } from "bson";

import User from "@/lib/models/user-model";

import Notification from "@/lib/models/notification-model";

import { getUserIdWithCheckToken } from "@/lib/auth/checkUser";

export async function GET(request: NextRequest) {
  try {
    const sessionResult = await getUserIdWithCheckToken(request);
    const IMAGE_SERVER_URL = process.env.IMAGE_SERVER_URL || "";

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

    // url에서 lng를 가져옵니다.
    const { searchParams } = new URL(request.url);
    let lng = searchParams.get("lng");

    // lng가 ko, en, ja 중 하나가 아니면 en으로 설정
    switch (lng) {
      case "ko":
      case "en":
      case "ja":
        break;
      default:
        lng = "en";
    }

    // 현재 날짜에서 3개월을 빼서 석 달 전 날짜를 계산
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // 석 달 전부터 오늘까지의 알림을 찾는 쿼리
    const notifications = await Notification.find({
      userId: objectUserId,
      createdAt: { $gte: threeMonthsAgo },
    }).sort({ createdAt: -1 });

    if (notifications.length === 0) {
      return NextResponse.json({}, { status: 200 });
    }

    const groupedData: { [key: string]: any } = {};

    notifications.forEach((notification) => {
      const notificationId = notification.notificationId;
      const tagId = notification.tagId;
      const tagName = notification.tag_name;
      const capsule = {
        capsuleId: notification.capsuleId,
        capsuleName: notification.capsule_name,
        brandName: notification.brand_name,
        releaseDate: dateTranslator(notification.release_date, lng),
        detailUrl: notification.detail_url,
        img: IMAGE_SERVER_URL + notification.img,
      };

      if (!groupedData[notificationId]) {
        groupedData[notificationId] = {
          notificationId,
          tags: {},
          confirmed: notification.confirmed,
          confirmedAt: notification.confirmedAt,
          createdAt: notification.createdAt,
        };
      }

      if (!groupedData[notificationId].tags[tagId]) {
        groupedData[notificationId].tags[tagId] = {
          tagId,
          tagName,
          capsules: [],
        };
      }

      groupedData[notificationId].tags[tagId].capsules.push(capsule);
    });

    const result = Object.values(groupedData).map((notification) => ({
      notificationId: notification.notificationId,
      tags: Object.values(notification.tags),
      confirmed: notification.confirmed,
      confirmedAt: notification.confirmedAt,
      createdAt: notification.createdAt,
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Internal Server Error: " + e },
      { status: 500 },
    );
  }
}
