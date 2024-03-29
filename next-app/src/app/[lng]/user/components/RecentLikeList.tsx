"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import Link from "next/link";
import LikedCapsuleCard from "./LikedCapsuleCard";
import { fetchLikedData } from "@/lib/fetch-data";
import LikedCapsuleCardSkeleton from "./LikedCapsuleCardSkeleton";
import { translate } from "@/app/i18n/client";
import { cacheTimeEnum } from "@/lib/enums";

export default function RecentLikeList({
  lng,
  searchParams,
}: {
  lng: string;
  searchParams: Record<string, string>;
}) {
  const limit = searchParams.limit || "4";
  const { t } = translate(lng, "like");

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery(
    ["recentLikes", lng],
    async () => {
      return fetchLikedData(lng, limit, "like", "desc", "", "1");
    },
    {
      cacheTime: cacheTimeEnum.FIVE_MINUTES * 1000,
      staleTime: cacheTimeEnum.ONE_MINUTE * 1000,
      refetchOnMount: false,
    },
  );

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
        <ul
          className={`moving_grid grid grid-cols-2 gap-x-6 gap-y-6 xs:grid-cols-3 md:grid-cols-4`}
        >
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
