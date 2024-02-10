"use client";

import React, { useEffect, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ICapsuleToy } from "@/lib/models/capsule-model";
import { arrivalFetchData } from "@/lib/fetch-data";
import { perPageEnum } from "@/lib/enums";
import { DisplayCapsuleOneTag } from "./display-capsule-tag";
import { useInView } from "react-intersection-observer";
import CapsuleCardSkeleton from "./CapsuleCardSkeleton";

import Link from "next/link";
import Image from "next/image";
import LikeButton from "./LikeButton";

function InfiniteCapsuleCards({
  lng,
  queryKey,
  queryParams,
}: {
  lng: string;
  queryKey: any[];
  queryParams?: Record<string, string>;
}) {
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();

  const {
    status,
    data,
    error,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = useInfiniteQuery(
    queryKey,
    async ({ pageParam = 1 }) => {
      const params = { ...queryParams, page: pageParam.toString() };
      const data = await arrivalFetchData(lng, params);
      return data;
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.totalCount - perPageEnum.SMALL * lastPage.page > 0
          ? lastPage.page + 1
          : undefined;
      },
    },
  );

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage]);

  // 좋아요 기능 추가 시 useMutation을 사용하여 캐시 업데이트

  return (
    <>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-10 xs:grid-cols-2 md:grid-cols-4">
        {data?.pages?.map((page: any) => {
          return page.capsules?.map((capsule: ICapsuleToy) => {
            return capsule.display_img ? (
              <li key={capsule._id}>
                <div>
                  <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md bg-gray-100">
                    <Link href={`/${lng}/capsule/${capsule._id}`}>
                      <Image
                        src={capsule.display_img}
                        alt={capsule.name}
                        width={400}
                        height={400}
                        className="scale-125 object-center transition duration-300 hover:translate-y-0 hover:scale-100 hover:opacity-90"
                      />
                    </Link>
                  </div>
                  <div>
                    <div className="pb-2 pt-4">
                      <Link href={`/${lng}/capsule/${capsule._id}`}>
                        <h1 className="max-lines-3 break-words text-base-semibold text-gray-800 xs:text-body-bold">
                          {capsule.name}
                        </h1>
                      </Link>
                    </div>
                    <div className="flex h-8 flex-row justify-between">
                      <div className="truncate-70 invisible xs:visible">
                        <DisplayCapsuleOneTag tags={capsule.tagId} lng={lng} />
                      </div>
                      <div className="flex text-subtle-medium text-gray-500">
                        <LikeButton
                          lng={lng}
                          like={capsule.like ?? false}
                          capsuleId={capsule._id}
                          queryKey={queryKey}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ) : null;
          });
        })}
      </ul>
      <div>
        {isFetching && !isFetchingNextPage && (
          <CapsuleCardSkeleton isFirst={true} />
        )}
      </div>
      <div ref={ref}>{isFetchingNextPage && <CapsuleCardSkeleton />}</div>
    </>
  );
}

export default InfiniteCapsuleCards;
