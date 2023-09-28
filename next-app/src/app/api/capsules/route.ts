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
import CapsuleToy, { ICapsuleToy } from "@/lib/models/capsule-model";
import Localization, { ILocalization } from "@/lib/models/localization-model";
import { searchParams } from "@/lib/search-params";
import { dateTranslator } from "@/lib/date-converter";
import { setDisplayImg } from "@/lib/set-display-img";
import { set } from "mongoose";

enum Sort {
  ASC = "asc",
  DESC = "desc",
}

export async function GET(request: Request) {
  try {
    const {
      lng,
      query,
      sort,
      currentPage,
      perPage,
      showDetailImg,
      locSearchName,
    } = searchParams(request.url);
    const capsules: ICapsuleToy[] = [];

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

    let locSearchCapsules: ILocalization[] = [];
    let locTotalCount = 0;

    if (locSearchName !== "") {
      locSearchCapsules = await Localization.find({
        capsuleId: { $exists: true },
        $or: [
          { name: new RegExp(locSearchName as string, "i") },
          { description: new RegExp(locSearchName as string, "i") },
        ],
      })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .sort({ _id: sort === Sort.ASC ? 1 : -1 })
        .populate({
          path: "capsuleId",
          model: CapsuleToy,
          match: { name: new RegExp("^((?!箱売).)*$", "i") },
        });
    }

    // populate된 도큐먼트에 箱売가 포함된 경우를 제외하고 반환했기 때문에 후가공 필요
    // capsuleId가 null인 도큐먼트를 제외
    locSearchCapsules = locSearchCapsules?.filter((capsule: ILocalization) => {
      if (capsule.capsuleId !== null) {
        return capsule;
      }
    });
    locTotalCount = locSearchCapsules.length;

    if (locSearchCapsules?.length > 0) {
      const anotherLocSearchCapsules = await Localization.find({
        capsuleId: {
          $in: locSearchCapsules.map(
            (capsule: ILocalization) => capsule.capsuleId._id
          ),
        },
        lng: { $ne: locSearchCapsules[0].lng },
      });

      locSearchCapsules.forEach((locCapsule: any) => {
        const temp = locCapsule.capsuleId.toObject();
        temp.date = temp.date.map((date: string) => {
          return dateTranslator(date, lng);
        });
        if (locCapsule.lng === lng) {
          temp.name = locCapsule.name;
          temp.description = locCapsule.description;
          temp.header = locCapsule.header;
        } else if (anotherLocSearchCapsules[0].lng === lng) {
          anotherLocSearchCapsules.forEach((anotherLanguage: ILocalization) => {
            if (
              anotherLanguage.capsuleId.toString() ===
              locCapsule.capsuleId._id.toString()
            ) {
              temp.name = anotherLanguage.name;
              temp.description = anotherLanguage.description;
              temp.header = anotherLanguage.header;
            }
          });
        }
        delete temp.localization;
        capsules.push(temp);
      });
    } else if (resultCapsules?.length > 0) {
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
    }

    setDisplayImg(capsules, showDetailImg);

    const returnConut =
      locSearchCapsules?.length > 0 ? locTotalCount : countCapsules;

    // 결과 반환하기
    return NextResponse.json(
      { totalCount: returnConut, capsules },
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
