// users API 라우터
// Path: next-app/src/app/api/users/route.ts

import mongoose from "mongoose";
import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import dbConnect from "@/lib/db/db-connect";
import User from "@/lib/models/user-model";
import Account from "@/lib/models/account-model";
import Like from "@/lib/models/like-model";
import { convertToObjectId } from "@/lib/db/convertObjectId";

import {
  revokeGitHubAppPermission,
  revokeDiscordAppPermission,
  revokeGoogleAppPermission,
} from "@/lib/oauthUnlink";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "";
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "";

// 유저 삭제 기능을 위한 API 라우터
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // 로그인이 되어있지 않으면 401 에러를 반환한다.
    if (!token) {
      console.log("Unauthorized");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // body에서 id를 추출.
    const { id } = params;
    const objectId = convertToObjectId(id);

    // id가 없으면 400 에러를 반환한다.
    if (!id) {
      console.log("Invalid request, id is missing");
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    // 데이터베이스 연결
    await dbConnect();

    // 유저가 존재하는지 확인
    const user = await User.findById(objectId);

    // 유저가 존재하지 않으면 404 에러를 반환한다.
    if (!user) {
      console.log("User not found");
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    // 소셜 연결 해제 전 provider 확인
    const provider = user.provider;

    // provider 정보가 없는 경우 400 에러를 반환한다.
    if (!provider) {
      console.log("Invalid request, provider is missing");
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const accountInfo = await Account.findOne({ userId: objectId });

    // account 정보가 없는 경우 400 에러를 반환한다.
    if (!accountInfo) {
      console.log("Account not found");
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    console.log("Account info:", accountInfo.toJSON());

    // 소셜 연결 해제
    // google, github, discord 등의 provider에 따라 다른 로직을 수행한다.

    // switch (provider) {
    //   case "google":
    //     // google 연결 해제 로직
    //     try {
    //       await revokeGoogleAppPermission(accountInfo.access_token);
    //     } catch (error) {
    //       console.error("Failed to revoke Google App permission", error);
    //       // Throw a custom error to be caught by the outer try-catch block
    //       throw new Error("OAuthRevokeError");
    //     }
    //     break;
    //   case "github":
    //     // github 연결 해제 로직
    //     try {
    //       await revokeGitHubAppPermission(
    //         GITHUB_CLIENT_ID,
    //         GITHUB_CLIENT_SECRET,
    //         accountInfo.access_token,
    //       );
    //       console.log("GitHub App permission revoked successfully");
    //     } catch (error) {
    //       console.error("Failed to revoke GitHub App permission", error);
    //       // Throw a custom error to be caught by the outer try-catch block
    //       throw new Error("OAuthRevokeError");
    //     }
    //     break;
    //   case "discord":
    //     // discord 연결 해제 로직
    //     try {
    //       await revokeDiscordAppPermission(
    //         DISCORD_CLIENT_ID,
    //         DISCORD_CLIENT_SECRET,
    //         accountInfo.access_token,
    //       );
    //     } catch (error) {
    //       console.error("Failed to revoke Discord App permission", error);
    //       // Throw a custom error to be caught by the outer try-catch block
    //       throw new Error("OAuthRevokeError");
    //     }
    //     break;
    //   default:
    //     return NextResponse.json(
    //       { message: "Invalid request" },
    //       { status: 400 },
    //     );
    // }

    // 유저 삭제
    // 세션 시작
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // 유저가 등록한 좋아요 데이터 삭제
      await Like.deleteMany({ userId: objectId }, { session });

      // 유저 정보 삭제
      await User.deleteOne({ _id: objectId }, { session });
      await Account.deleteOne({ userId: objectId }, { session });

      // 트랜잭션 커밋
      await session.commitTransaction();
      console.log("Transaction committed");
    } catch (error) {
      await session.abortTransaction(); // 트랜잭션 롤백
      console.error("Transaction aborted due to an error: ", error);
    } finally {
      session.endSession(); // 세션 종료
    }

    return NextResponse.json({ status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "OAuthRevokeError") {
        return NextResponse.json(
          { message: "Failed to revoke OAuth permissions" },
          { status: 500 },
        );
      }
    }
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
