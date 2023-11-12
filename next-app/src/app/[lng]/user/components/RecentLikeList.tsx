"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import LikedCapsuleCard from "./LikedCapsuleCard";
import { fetchLikedData } from "@/lib/fetch-data";
import LikedCapsuleCardSkeleton from "./LikedCapsuleCardSkeleton";

export default function RecentLikeList({
  lng,
  searchParams,
}: {
  lng: string;
  searchParams: Record<string, string>;
}) {
  const [data, setData] = useState<any>(null);
  const limit = searchParams.limit || "4";

  useEffect(() => {
    fetchLikedData(lng, limit).then((res) => {
      setData(res);
    });
  }, [lng, limit]);

  return (
    <article className="space-y-4">
      <div className="flex items-end justify-between">
        <h1 className="text-heading2.5-bold">최근 좋아요</h1>
        <span>
          <Link href={`/${lng}/like-list`}>목록 전체보기</Link>
        </span>
      </div>
      <ul className="grid gap-x-6 gap-y-6 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 fold:grid-cols-2 3xs:grid-cols-2 2xs:grid-cols-2 xs:grid-cols-2">
        {data ? (
          data?.likes?.map((like: any) => (
            <LikedCapsuleCard
              id={like.capsuleId._id}
              name={like.capsuleId.name}
              date={like.capsuleId.date}
              img={like.capsuleId.display_img}
              tags={like.capsuleId.tagId}
              lng={lng}
            />
          ))
        ) : (
          <LikedCapsuleCardSkeleton />
        )}
      </ul>
    </article>
  );
}
