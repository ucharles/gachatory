import { cookies } from "next/headers";

import RecentLikeList from "../components/RecentLikeList";
import KeywordSubscription from "../components/KeywordSubscription";
import getQueryClient from "@/components/Providers/getQueryClient";
import Hydrate from "@/components/Providers/HydrateClient";
import { dehydrate } from "@tanstack/react-query";
import { fetchLikedData } from "@/lib/fetch-data";
export default async function Page({
  params: { lng },
  searchParams,
}: {
  params: { lng: string };
  searchParams: Record<string, string>;
}) {
  const cookie = cookies();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["recentLikes", lng],
    queryFn: () => {
      return fetchLikedData(lng, "4", "like", "desc", "", "1", cookie);
    },
  });
  return (
    <main className="w-full space-y-5">
      <Hydrate state={dehydrate(queryClient)}>
        <RecentLikeList lng={lng} searchParams={searchParams} />
        <div className="p-2"></div>
        <KeywordSubscription lng={lng} />
      </Hydrate>
    </main>
  );
}
