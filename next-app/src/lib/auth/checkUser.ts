import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 - `next-auth/jwt` 모듈을 사용하여 JWT 토큰을 확인하고, 토큰이 유효한 경우 토큰에 포함된 `userId`를 반환하는 함수.
 @param request NextRequest 객체
 @returns `userId` 문자열 또는 `NextResponse` 객체
 */
export async function getUserIdWithCheckToken(request: NextRequest) {
  let token;
  try {
    token = await getToken({ req: request });
  } catch (error) {
    console.error("JWT Token Error: ", error);
    return NextResponse.json(
      {
        message: "JWT Token Error:" + error,
      },
      { status: 500 },
    );
  }
  let userId = token?.sub; // add null check for token

  if (!userId) {
    return NextResponse.next();
  }

  return userId;
}
