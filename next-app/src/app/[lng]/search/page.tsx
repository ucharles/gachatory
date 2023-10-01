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

import SearchForm from "@/app/[lng]/components/search-form-copy";
import Pagination from "@/app/[lng]/components/pagination";
import SearchLimit from "@/app/[lng]/components/search-limit";
import { translate } from "@/app/i18n";
import getQueryClient from "../components/Providers/getQueryClient";
import { dehydrate } from "@tanstack/query-core";
import Hydrate from "../components/Providers/HydrateClient";
import CapsuleCards from "../components/CapsuleCards";
import { searchFetchData } from "@/lib/fetch-data";
import MoveOnTopAndDisplayDate from "../components/MoveOnTopAndDisplayDate";
export default async function Page({
  params: { lng },
  searchParams,
}: {
  params: { lng: string };
  searchParams: { param1: string; param2: string };
}) {
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

  return (
    <div>
      <Hydrate state={dehydratedState}>
        {data ? (
          <div>
            <div className="">
              <div className="pb-3">
                <h1 className="text-heading3-bold">{t("result")}</h1>
              </div>
              <div className="flex w-full justify-between self-center">
                <h2 className="text-heading4-medium">
                  {t("total-count")}: {data.totalCount}
                </h2>
                <SearchLimit lng={lng} />
              </div>
            </div>
            {data?.totalCount > 0 ? (
              <Pagination total={data.totalCount} />
            ) : null}
            <CapsuleCards
              lng={lng}
              queryKey={["searchCapsules", queryParams, lng]}
              pageName="search"
              queryParams={queryParams}
            />
            {data?.totalCount > 0 ? (
              <Pagination total={data.totalCount} />
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
