"use client";

import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ICapsuleToy } from "@/lib/models/capsule-model";
import { arrivalFetchData, searchFetchData } from "@/lib/fetch-data";
import { cacheTimeEnum } from "@/lib/enums";
import { DisplayCapsuleOneTag } from "./display-capsule-tag";

import Link from "next/link";
import Image from "next/image";
import LikeButton from "./LikeButton";

function CapsuleCards({
  lng,
  queryKey,
  pageName,
  queryParams,
}: {
  lng: string;
  queryKey: any[];
  pageName: string;
  queryParams?: Record<string, string>;
}) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery(
    queryKey,
    async () => {
      return searchFetchData(lng, queryParams);
    },
    {
      cacheTime: cacheTimeEnum.FIVE_MINUTES * 1000,
      staleTime: cacheTimeEnum.ONE_MINUTE * 1000,
      refetchOnMount: false,
    },
  );

  // 좋아요 기능 추가 시 useMutation을 사용하여 캐시 업데이트

  return (
    <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 fold:grid-cols-2 3xs:grid-cols-2 2xs:grid-cols-2 xs:grid-cols-2">
      {isLoading ? <p>Loading...</p> : null}
      {data?.capsules?.map((capsule: ICapsuleToy) => {
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
                    <p className="inline-block text-small-regular text-gray-600">
                      {capsule.date[0]}
                    </p>
                    <h1 className="max-lines-3 break-words text-body-bold text-gray-800 3xs:text-base-semibold">
                      {capsule.name}
                    </h1>
                  </Link>
                </div>
                <div className="flex flex-row justify-between">
                  <div className="truncate-70 fold:invisible">
                    <DisplayCapsuleOneTag tags={capsule.tagId} lng={lng} />
                  </div>
                  <div className="flex space-x-2 text-subtle-medium text-gray-500">
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
      })}
    </ul>
  );
}

export default CapsuleCards;
