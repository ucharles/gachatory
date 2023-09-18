import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/db-connect";
import CapsuleTag from "@/lib/models/capsule-tag-model";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    // DB 연결하기
    dbConnect();

    // URL 파라미터 가져오기
    // tag 파라미터는 v: 검색 문자열
    const params = new URLSearchParams(new URL(request.url).search);

    // 정규식 관련 문자열 이스케이프 처리
    if (params.get("v")) {
      params.set(
        "v",
        params.get("v")?.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") as string
      );
    }

    // 검색 문자열 가져오기
    const searchString = new RegExp(params.get("v") as string, "i");

    const chunkSize = 24;
    const regex = new RegExp(`.{1,${chunkSize}}`, "g");

    const tagIds = params.get("id")?.match(regex);
    const filteredTagIds = tagIds?.filter((tagId) => tagId.length === 24);
    const objectIdTagIds = filteredTagIds?.map((tagId) => new ObjectId(tagId));

    // DB 검색하기
    let resultCapsuleTags = [];
    if (!objectIdTagIds && !params.get("v")) {
      resultCapsuleTags = await CapsuleTag.aggregate([
        { $sort: { linkCount: -1 } },
        { $group: { _id: "$property", items: { $push: "$$ROOT" } } },
        {
          $project: {
            _id: 0,
            items: { $slice: ["$items", 5] },
          },
        },
        { $unwind: "$items" },
      ]);

      resultCapsuleTags = resultCapsuleTags.map((item: any) => item.items);
    } else if (objectIdTagIds) {
      resultCapsuleTags = await CapsuleTag.find({
        _id: { $in: objectIdTagIds },
      });
    } else if (searchString) {
      resultCapsuleTags = await CapsuleTag.find({
        $or: [{ ja: searchString }, { en: searchString }, { ko: searchString }],
      }).sort({ linkCount: -1 });
    }

    return NextResponse.json(resultCapsuleTags, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
