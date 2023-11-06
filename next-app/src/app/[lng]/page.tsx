import { translate } from "../i18n";
import { redirect } from "next/navigation";
import getQueryClient from "./components/Providers/getQueryClient";
import { dehydrate } from "@tanstack/query-core";
import Hydrate from "./components/Providers/HydrateClient";
import InfiniteCapsuleCards from "./components/InfiniteCapsuleCards";
import { arrivalFetchData } from "@/lib/fetch-data";
import {
  getCurrentMonthYYYYMM,
  isYYYYMMFormat,
} from "@/lib/search-date-string";
import MoveOnTopAndDisplayDate from "./components/MoveOnTopAndDisplayDate";
import { sortEnum } from "@/lib/enums";
import ReleaseDateList from "./components/ReleaseDateList";
import SortCapsuleList from "./components/SortCapsuleList";

export default async function Page({
  params: { lng },
  searchParams,
}: {
  params: { lng: string };
  searchParams: Record<string, string>;
}) {
  const params = new URLSearchParams(searchParams);

  const paramDate = params.get("date") || getCurrentMonthYYYYMM();
  const paramSort = params.get("sort") || sortEnum.DESC;

  if (
    paramDate.length !== 6 ||
    !/^\d+$/.test(paramDate) ||
    parseInt(paramDate) > parseInt(getCurrentMonthYYYYMM()) ||
    !isYYYYMMFormat(paramDate)
  ) {
    // 6자리가 아니고, 숫자가 아니고, 현재 년월보다 이후이고, YYYYMM 형식이 아니고, 현재 년월로부터 6개월 이전일 경우
    redirect(`/${lng}`);
  }

  if (paramSort !== sortEnum.ASC && paramSort !== sortEnum.DESC) {
    if (params.has("date")) {
      redirect(`/${lng}?date=${paramDate}`);
    } else {
      redirect(`/${lng}`);
    }
  }

  const date = paramDate;
  const sort = paramSort;

  const cacheParams = { date: date, sort: sort, lng: lng };

  // URL의 Search Parameter를 가져옴
  // { param1: "value1", param2: "value2" ...}

  // 날짜, 정렬 상태는 URL로 주고 받도록 함
  // default: date: 현재 년월, sort: desc
  // url: /[lng]?date=202309&sort=desc
  // date는 리스트에서 최근 6개월까지 보여주고, 그 이후는 검색으로 보내도록 함

  // 유효성 검사: date, sort / 프론트와 백엔드 동시 수행
  // date가 6자리 숫자가 아닐 경우, default(현재 년월)로 설정
  // date의 형식이 YYYYMM이 아닐 경우, default(현재 년월)로 설정
  // date가 현재 년월보다 이후일 경우, default(현재 년월)로 설정
  // date가 현재 년월로부터 6개월 이전일 경우, 검색으로 보내도록 함
  // sort가 asc나 desc가 아닐 경우, default(desc)로 설정

  // const queryClient = getQueryClient();
  // await queryClient.prefetchInfiniteQuery(
  //   ["arrivalCapsules", lng, cacheParams],
  //   () => {
  //     console.log("prefetch");
  //     return arrivalFetchData(lng, searchParams);
  //   },
  // );
  // const dehydratedState = dehydrate(queryClient);

  // const data = await fetchData(lng);
  const { t } = await translate(lng);
  console.log(cacheParams);

  return (
    <main>
      <div className="z-30 bg-background-white/95 pb-6">
        <ReleaseDateList lng={lng} searchParams={searchParams} />
        <div className="flex justify-between text-small-medium">
          <div className="fold:hidden">
            {paramDate === getCurrentMonthYYYYMM()
              ? t("release_discription")
              : t("past-release-discription")}
          </div>
          <SortCapsuleList lng={lng} searchParams={searchParams} />
        </div>
      </div>
      {/* <Hydrate state={dehydratedState}> */}
      <InfiniteCapsuleCards
        lng={lng}
        queryParams={cacheParams}
        queryKey={["arrivalCapsules", cacheParams]}
      />
      {/* </Hydrate> */}
      <MoveOnTopAndDisplayDate date={date} displayDate={true} />
    </main>
  );
}
