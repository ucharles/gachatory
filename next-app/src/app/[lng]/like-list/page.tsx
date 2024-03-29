import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getServerSession } from "next-auth/next";
import { options } from "@/app/api/auth/[...nextauth]/options";

import LikedCapsulesListItem from "./components/LikedCapsulesListItem";
import { fetchLikedData } from "@/lib/fetch-data";

import { QueryClient } from "@tanstack/react-query";
import Hydrate from "../../../components/Providers/HydrateClient";
import { translate } from "@/app/i18n";
import { sortEnum } from "@/lib/enums";

import LikeSort from "./components/LikeSort";

import { dehydrate } from "@tanstack/query-core";

/*
@Path
- /:lng/like-list
@Params
- lng: string
- searchParams: Record<string, string>
@searchParams
- like-order: asc | desc
- recent-order: asc | desc
@Description
- 좋아요 리스트 페이지
- 무한 스크롤로 데이터를 불러옴
- 세션이 없으면 메인 페이지로 이동
*/
export default async function Page({
  params: { lng },
  searchParams,
}: {
  params: { lng: string };
  searchParams: Record<string, string>;
}) {
  // 세션이 없으면 메인 페이지로 이동
  const session = await getServerSession(options);

  if (session === null) {
    redirect("/");
  }

  const { t } = await translate(lng, "like");
  const params = new URLSearchParams(searchParams);

  // 유효성 검사: sortOrder, sortBy / Server Component에서 수행
  const paramSortOrder = params.get("sortOrder") || sortEnum.DESC;
  const paramSortBy = params.get("sortBy") || "like";

  if (
    paramSortOrder !== sortEnum.ASC &&
    paramSortOrder !== sortEnum.DESC &&
    paramSortOrder !== "" &&
    paramSortOrder !== undefined
  ) {
    redirect(`/${lng}/like-list`);
  }

  if (
    paramSortBy !== "like" &&
    paramSortBy !== "release" &&
    paramSortBy !== "" &&
    paramSortBy !== undefined
  ) {
    redirect(`/${lng}/like-list`);
  }

  const cacheParams = {
    sortOrder: paramSortOrder,
    sortBy: paramSortBy,
    lng: lng,
  };

  const cookie = cookies();

  // const queryClient = new QueryClient();
  // const data = await queryClient.prefetchQuery(["likedCapsules", lng], () => {
  //   return fetchLikedData(lng, "20", cookie);
  // });
  // const dehydratedState = dehydrate(queryClient);

  return (
    // <Hydrate state={dehydratedState}>
    <main className="space-y-5">
      <article className="space-y-4">
        <div className="flex flex-col justify-between space-y-2 xs:flex-row">
          <h1 className="text-heading2.5-bold">{t("like-list")}</h1>
          {/* <div className="w-full xs:w-80">
              <div className="w-auto rounded-3xl bg-bg-footer px-6 py-3 text-small-medium">
                {t("search-in-like-list")}
              </div>
            </div> */}
        </div>
        <div className="flex justify-end space-x-6 text-end text-small-medium">
          <p>{t("sort-by")}</p>
          <LikeSort
            lng={lng}
            searchParams={searchParams}
            paramName={"sortOrder"}
          />
        </div>
      </article>
      <article>
        <LikedCapsulesListItem
          lng={lng}
          queryKey={["likedCapsules", cacheParams]}
          searchParams={searchParams}
        />
      </article>
    </main>
    // </Hydrate>
  );
}
