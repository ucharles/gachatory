// /api/get-capsules
// GET /api/capsules

// How to get query parameters in Next.js API routes
// https://www.slingacademy.com/article/next-js-api-routes-how-to-get-parameters-query-string/

// How to implement pagination in nextjs api routes with mongoose
// https://choice91.tistory.com/57

// skip()이 비용이 많이 드니 createdAt을 기준으로 정렬하는 게 낫다는 의견도 있다.
// 하지만 capsule-toy의 데이터는 batch로 일괄 등록되기 때문에 createdAt을 기준으로 정렬하기는 어려울지도...
// https://stackoverflow.com/questions/5539955/how-to-paginate-with-mongoose-in-node-js

// mongoose overwrite model error
// Cannot overwrite `CapsuleToy` model once compiled.
// 모델 이름이 겹쳐서 생기는 문제?
// https://stackoverflow.com/questions/28688437/mongoose-overwritemodelerror-cannot-overwrite-model-once-compiled

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/db-connect";
import CapsuleToy from "@/lib/models/capsule-model";
import Localization, { ILocalization } from "@/lib/models/localization-model";
import { searchParams } from "@/lib/search-params";
import { dateTranslator } from "@/lib/date-converter";
import { setDisplayImg } from "@/lib/set-display-img";

enum Sort {
  ASC = "asc",
  DESC = "desc",
}

const IMAGE_URI = process.env.IMAGE_SERVER_URL;

export async function GET(request: Request) {
  try {
    const { lng, query, sort, currentPage, perPage, showDetailImg } =
      searchParams(request.url);
    const capsules: any = [];

    // DB 연결하기
    dbConnect();
    // DB 검색하기
    const countCapsules = await CapsuleToy.countDocuments(query);

    const resultCapsules = await CapsuleToy.find(query)
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .sort({ _id: sort === Sort.ASC ? 1 : -1 })
      .populate({
        path: "localization",
        model: Localization,
      });

    resultCapsules.forEach((capsule) => {
      let temp = capsule.toObject();

      temp.date = capsule.date.map((date: string) => {
        return dateTranslator(date, lng);
      });

      capsule.localization?.forEach((language: ILocalization) => {
        if (language.lng === lng) {
          temp.name = language.name;
          temp.description = language.description;
          temp.header = language.header;
        }
      });

      delete temp.localization;
      capsules.push(temp);
    });

    setDisplayImg(capsules, showDetailImg);

    // 결과 반환하기
    return NextResponse.json(
      { totalCount: countCapsules, capsules },
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
