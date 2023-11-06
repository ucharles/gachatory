import Link from "next/link";
import LikedCapsuleCardSkeleton from "./LikedCapsuleCardSkeleton";
import LikedCapsuleCard from "./LikedCapsuleCard";
import { fetchLikedData } from "@/lib/fetch-data";
import { cookies } from "next/headers";

export default async function RecentLikeList({
  lng,
  searchParams,
}: {
  lng: string;
  searchParams: Record<string, string>;
}) {
  const limit = searchParams.limit || "4";
  const cookie = cookies();

  const data: any = await fetchLikedData(lng, limit, cookie);
  return (
    <article className="space-y-4">
      <div className="flex items-end justify-between">
        <h1 className="text-heading2.5-bold">최근 좋아요</h1>
        <span>
          <Link href={`/${lng}/like-list`}>목록 전체보기</Link>
        </span>
      </div>
      <ul className="grid gap-x-6 gap-y-6 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 fold:grid-cols-2 3xs:grid-cols-2 2xs:grid-cols-2 xs:grid-cols-2">
        {data?.likes?.map((like: any) => (
          <LikedCapsuleCard
            id={like.capsuleId._id}
            name={like.capsuleId.name}
            date={like.capsuleId.date}
            img={like.capsuleId.display_img}
            tags={like.capsuleId.tagId}
            lng={lng}
          />
        ))}
      </ul>
    </article>
  );
}
