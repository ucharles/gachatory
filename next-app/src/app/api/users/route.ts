// users API 라우터
// Path: next-app/src/app/api/users/route.ts
// 유저 삭제 기능을 위한 API 라우터

import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db/db-connect";
import { getToken } from "next-auth/jwt";

export async function DELETE(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 로그인이 되어있지 않으면 401 에러를 반환한다.
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // 로그인이 되어있으면 삭제를 진행한다.

  // 요청 바디에서 id를 가져온다.
  const { id } = request.body;

  if (!id) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  return NextResponse.json({ status: 200 });
}
