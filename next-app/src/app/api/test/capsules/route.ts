import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/db-connect";
import CapsuleToy from "@/lib/models/capsule-model";

export async function GET(request: Request) {
  try {
    // DB 연결하기
    dbConnect();
    // 모델 가져오기
    const capsules = CapsuleToy;
    // DB 검색하기
    const allCapsules = await capsules.find({});

    // 결과 반환하기
    return NextResponse.json(
      {
        allCapsules,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
