// in server component can get search params like this
// https://www.reddit.com/r/nextjs/comments/10ut3k0/how_to_get_query_parameters_in_nextjs_13/

// export default function Page({
//   params,
//   searchParams,
//   }: {
//   params: { slug: string }
//   searchParams: { [key: string]: string | string[] | undefined }
//   }) {
//   return <h1>My Page</h1>
//   }

import Pagination from "@/app/[lng]/components/pagination";
import SearchLimit from "@/app/[lng]/components/search-limit";
import { redirect } from "next/navigation";
import { translate } from "@/app/i18n";
import getQueryClient from "../components/Providers/getQueryClient";
import { dehydrate } from "@tanstack/query-core";
import Hydrate from "../components/Providers/HydrateClient";
import CapsuleCards from "../components/CapsuleCards";
import { searchFetchData } from "@/lib/fetch-data";
import MoveOnTopAndDisplayDate from "../components/MoveOnTopAndDisplayDate";
import SortCapsuleList from "../components/SortCapsuleList";
import { sortEnum } from "@/lib/enums";

function calculateTotalPages(total: number, itemsPerPage: number) {
  return Math.ceil(total === 0 ? 1 : total / itemsPerPage);
}
export default async function Page({
  params: { lng },
  searchParams,
}: {
  params: { lng: string };
  searchParams: Record<string, string>;
}) {
  if (searchParams.page === undefined) {
    searchParams.page = "1";
  }

  const page = searchParams.page || "1";
  const limit = searchParams.limit || "20";
  const paramSort = searchParams.sort || sortEnum.DESC;

  const keyword = searchParams.name;
  const tagId = searchParams.tag;

  const queryParams = searchParams;
  const { t } = await translate(lng, "search");

  const queryClient = getQueryClient();
  const data = await queryClient.fetchQuery(
    ["searchCapsules", queryParams, lng],
    () => {
      return searchFetchData(lng, queryParams);
    },
  );

  const dehydratedState = dehydrate(queryClient);
  const maxPageDesktop = 10;
  const maxPageMobile = 5;

  // 유효성 검사: sort / 서버에서 수행
  if (paramSort !== sortEnum.ASC && paramSort !== sortEnum.DESC) {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sort", sortEnum.DESC);
    redirect(`?${newParams.toString()}`);
  }

  const pagenation = (lng: string) => {
    switch (lng) {
      case "ko":
        return `${calculateTotalPages(
          data.totalCount,
          Number(limit),
        )} 페이지 중 ${page} 페이지`;
      case "ja":
        return `全${calculateTotalPages(data.totalCount, Number(limit))}ページ`;
      case "en":
        return `Page ${page} of ${calculateTotalPages(
          data.totalCount,
          Number(limit),
        )}`;
      default:
        return `Page ${page} of ${calculateTotalPages(
          data.totalCount,
          Number(limit),
        )}`;
    }
  };

  return (
    <div className="pt-5">
      <Hydrate state={dehydratedState}>
        {data ? (
          <div>
            <div className="pb-3">
              <div className="pb-3">
                <h1 className="space-x-2 text-heading3-bold">
                  <span className="text-gigas-700">
                    {keyword ? `'${keyword}'` : tagId ? `'#${tagId}'` : "''"}
                  </span>
                  <span>{t("result")}</span>
                </h1>
              </div>
              <div className="flex w-full items-end justify-between">
                <h2 className="text-heading4-medium">{data.totalCount}건</h2>
                <div className="flex items-center justify-center space-x-6 text-small-medium">
                  <SearchLimit lng={lng} />
                  <SortCapsuleList lng={lng} searchParams={searchParams} />
                </div>
              </div>
            </div>
            {data?.totalCount > 0 ? (
              <>
                <div className="flex justify-end sm:hidden md:hidden lg:hidden xl:hidden">
                  <Pagination
                    total={data.totalCount}
                    maxPages={maxPageMobile}
                  />
                </div>
                <div className="flex justify-end fold:hidden 3xs:hidden 2xs:hidden xs:hidden">
                  <Pagination
                    total={data.totalCount}
                    maxPages={maxPageDesktop}
                  />
                </div>
                <div className="flex justify-end pb-6 pt-3 text-small-medium">
                  {pagenation(lng)}
                </div>
              </>
            ) : null}
            <CapsuleCards
              lng={lng}
              queryKey={["searchCapsules", queryParams, lng]}
              pageName="search"
              queryParams={queryParams}
            />
            {data?.totalCount > 0 ? (
              <div className="pt-10">
                <div className="flex justify-end sm:hidden md:hidden lg:hidden xl:hidden">
                  <Pagination
                    total={data.totalCount}
                    maxPages={maxPageMobile}
                  />
                </div>
                <div className="flex justify-end fold:hidden 3xs:hidden 2xs:hidden xs:hidden">
                  <Pagination
                    total={data.totalCount}
                    maxPages={maxPageDesktop}
                  />
                </div>
                <div className="flex justify-end pb-6 pt-3 text-small-medium">
                  {pagenation(lng)}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <h1>{t("no-result")}</h1>
        )}
      </Hydrate>
      <MoveOnTopAndDisplayDate date="" />
    </div>
  );
}
