import SortCapsuleList from "../components/SortCapsuleList";
import LikedCapsulesListItem from "./components/LikedCapsulesListItem";
import { fetchLikedData } from "@/lib/fetch-data";
import { cookies } from "next/headers";
import { QueryClient } from "@tanstack/react-query";

export default async function Page({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const cookie = cookies();

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["likedData", lng],
    queryFn: () => fetchLikedData(lng, "20", cookie),
  });

  return (
    <main className="space-y-4">
      <article className="flex justify-between">
        <h1 className="text-heading2.5-bold">좋아요 목록</h1>
        <div className="basis-1/4 space-y-2">
          <div className="w-auto rounded-3xl bg-bg-footer px-6 py-3 text-small-medium">
            목록 내 검색하기
          </div>
          <div className="text-end text-small-medium">정렬 | 발매일 최신순</div>
        </div>
      </article>
      <article className="h-96 w-auto">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <ul>
            <LikedCapsulesListItem />
          </ul>
        </div>
      </article>
    </main>
  );
}
