import SortCapsuleList from "./components/SortCapsuleList";
import LikedCapsulesListItem from "./components/LikedCapsulesListItem";
import { fetchLikedData } from "@/lib/fetch-data";
import { cookies } from "next/headers";
import { QueryClient } from "@tanstack/react-query";
import Hydrate from "../components/Providers/HydrateClient";
import { translate } from "@/app/i18n";

import { dehydrate } from "@tanstack/query-core";

export default async function Page({
  params: { lng },
  searchParams,
}: {
  params: { lng: string };
  searchParams: Record<string, string>;
}) {
  const params = new URLSearchParams(searchParams);

  const { t } = await translate(lng, "like");

  const cookie = cookies();

  const queryClient = new QueryClient();
  const data = await queryClient.prefetchQuery(["likedData", lng], () => {
    return fetchLikedData(lng, "20", cookie);
  });
  const dehydratedState = dehydrate(queryClient);

  return (
    <Hydrate state={dehydratedState}>
      <main className="space-y-5">
        <article className="space-y-4">
          <div className="flex flex-row justify-between fold:flex-col fold:space-y-2 3xs:flex-col 3xs:space-y-2 2xs:flex-col 2xs:space-y-2">
            <h1 className="text-heading2.5-bold">{t("like-list")}</h1>
            <div className="w-80 fold:w-full 3xs:w-full 2xs:w-full">
              <div className="w-auto rounded-3xl bg-bg-footer px-6 py-3 text-small-medium">
                {t("search-in-like-list")}
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-6 text-end text-small-medium">
            <p>{t("sort-by")}</p>
            <SortCapsuleList
              lng={lng}
              searchParams={searchParams}
              paramName={"recent-order"}
            />
            <SortCapsuleList
              lng={lng}
              searchParams={searchParams}
              paramName={"like-order"}
            />
          </div>
        </article>
        <article>
          <LikedCapsulesListItem
            lng={lng}
            queryKey={["likedData", lng]}
            searchParams={searchParams}
          />
        </article>
      </main>
    </Hydrate>
  );
}