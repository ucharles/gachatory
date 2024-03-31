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

import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db/db-connect";
import CapsuleToy, { ICapsuleToy } from "@/lib/models/capsule-model";
import Localization, { ILocalization } from "@/lib/models/localization-model";
import CapsuleTag from "@/lib/models/capsule-tag-model";
import { searchParams } from "@/lib/search-params";
import { dateTranslator } from "@/lib/date-converter";
import { setDisplayImg } from "@/lib/set-display-img";
import { convertToObjectId } from "@/lib/db/convertObjectId";
import Like, { ILike } from "@/lib/models/like-model";
import { getToken } from "next-auth/jwt";
import { sortEnum } from "@/lib/enums";

export async function GET(request: NextRequest) {
  try {
    const {
      lng,
      query,
      sort,
      sortField,
      currentPage,
      perPage,
      showDetailImg,
      locSearchName,
    } = searchParams(request.url);
    const capsules: ICapsuleToy[] = [];

    // DB 연결하기
    dbConnect();

    // DB 검색하기

    let sortQuery = {};

    if (sortField === "date") {
      sortQuery = {
        dateISO: sort === sortEnum.ASC ? 1 : -1,
        _id: sort === sortEnum.ASC ? 1 : -1,
      };
    } else {
      sortQuery = { _id: sort === sortEnum.ASC ? 1 : -1 };
    }

    const countCapsules = await CapsuleToy.countDocuments(query);
    const resultCapsules = await CapsuleToy.find(query)
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .sort(sortQuery)
      .populate({
        path: "localization",
        model: Localization,
      })
      .populate({ path: "tagId", model: CapsuleTag });

    let locSearchCapsules: ILocalization[] = [];
    let locTotalCount = 0;

    if (locSearchName !== "" && resultCapsules?.length === 0) {
      locSearchCapsules = await Localization.find({
        capsuleId: { $exists: true },
        $or: [
          { name: new RegExp(locSearchName as string, "i") },
          { description: new RegExp(locSearchName as string, "i") },
        ],
      })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .populate([
          {
            path: "capsuleId",
            model: CapsuleToy,
            match: { name: new RegExp("^((?!箱売).)*$", "i") },
            populate: { path: "tagId", model: CapsuleTag },
          },
        ]);
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
            (capsule: ILocalization) => capsule.capsuleId._id,
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

    // JWT 토큰에서 유저 정보 가져오기
    let token;
    try {
      token = await getToken({ req: request });
    } catch (error) {
      console.error("JWT Token Error: ", error);
      return NextResponse.json(
        {
          message: "Internal Server Error",
        },
        { status: 500 },
      );
    }

    if (token) {
      // 좋아요 여부 확인하기
      const capsuleIds = capsules.map((capsule) =>
        convertToObjectId(capsule._id),
      );

      const userId = token.sub;

      let likeCapsules: ILike[] = [];
      try {
        likeCapsules = await Like.find({
          userId: convertToObjectId(userId!),
          capsuleId: { $in: capsuleIds },
        });
      } catch (error) {
        console.error(error);
      }

      capsules.forEach((capsule) => {
        capsule.like = false;
        likeCapsules.forEach((like) => {
          if (like.capsuleId.toString() === capsule._id.toString()) {
            capsule.like = like.state;
          }
        });
      });
    }

    setDisplayImg(capsules, showDetailImg);
    // capsules의 dateISO(배열로 구성된 날짜)를 sort를 기준으로 정렬하기
    // sort가 dateISO일 때만 정렬하기
    if (sortField === "date" && capsules?.length > 0) {
      capsules.sort((a, b) => {
        // dateISO가 존재할 때만 정렬하기
        if (!a.dateISO || !b.dateISO) {
          return 0;
        }

        const aDate = a.dateISO[0];
        const bDate = b.dateISO[0];
        if (aDate < bDate) {
          return sort === sortEnum.ASC ? -1 : 1;
        }
        if (aDate > bDate) {
          return sort === sortEnum.ASC ? 1 : -1;
        }
        return 0;
      });
    }

    const returnConut =
      locSearchCapsules?.length > 0 ? locTotalCount : countCapsules;

    // 결과 반환하기
    return NextResponse.json(
      { totalCount: returnConut, capsules, page: currentPage },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
