// /api/capsules/id
// GET /api/capsules/id

// Dynamic API routes
// https://nextjs.org/docs/pages/building-your-application/routing/api-routes#dynamic-api-routes

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/db-connect";
import { ObjectId } from "mongodb";
import Capsule from "@/lib/models/capsule-model";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // DB 연결하기
    dbConnect();
    // DB 검색하기
    const capsule = await Capsule.findById(new ObjectId(params.id)).exec();
    // 결과 반환하기
    return NextResponse.json(capsule, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
  // else if (req.method === "POST") {
  //     try {
  //         dbConnect();
  //         // 모델 가져오기
  //         const data = req.body;
  //         const { title, content, date } = data;
  //     } catch (error) {
  //         console.error(error);
  //         res.status(500).json({ message: "Internal server error" });
  //     }
  // }
}
