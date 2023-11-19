"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import LikedCapsuleCard from "./LikedCapsuleCard";
import { fetchLikedData } from "@/lib/fetch-data";
import LikedCapsuleCardSkeleton from "./LikedCapsuleCardSkeleton";
import { translate } from "@/app/i18n/client";

export default function RecentLikeList({
  lng,
  searchParams,
}: {
  lng: string;
  searchParams: Record<string, string>;
}) {
  const [data, setData] = useState<any>(null);
  const limit = searchParams.limit || "4";
  const { t } = translate(lng, "like");

  useEffect(() => {
    fetchLikedData(lng, limit).then((res) => {
      setData(res);
    });
  }, [lng, limit]);

  return (
    <article className="space-y-4">
      <div className="flex items-end justify-between">
        <h1 className="text-heading2.5-bold">{t("recent-like")}</h1>
        <span>
          <Link href={`/${lng}/like-list`}>{t("view-all")}</Link>
        </span>
      </div>
      {data?.likes?.length === 0 ? (
        <div className="space-y-2">
          <p className="text-heading4-bold">{t("no-liked-message-1")}</p>
          <p>{t("no-liked-message-2")}</p>
        </div>
      ) : (
        <ul className="grid gap-x-6 gap-y-6 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 fold:grid-cols-2 3xs:grid-cols-2 2xs:grid-cols-2 xs:grid-cols-2">
          {data?.likes ? (
            data?.likes?.map((like: any) => (
              <LikedCapsuleCard
                key={like.capsuleId._id}
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
      )}
    </article>
  );
}
