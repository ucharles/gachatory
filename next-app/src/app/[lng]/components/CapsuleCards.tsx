"use client";

import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ICapsuleToy } from "@/lib/models/capsule-model";
import { arrivalFetchData, searchFetchData } from "@/lib/fetch-data";
import { cacheTimeEnum } from "@/lib/enums";
import { DisplayCapsuleOneTag } from "./display-capsule-tag";

import Link from "next/link";
import Image from "next/image";

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
      let data;
      if (pageName === "arrival" && queryParams) {
        const previousData = queryClient.getQueryData([
          "arrivalCapsules",
          lng,
          queryParams,
        ]);
        if (previousData) {
          data = previousData;
        } else {
          data = await arrivalFetchData(lng, queryParams);
        }
      } else if (pageName === "search" && queryParams) {
        const previousData = queryClient.getQueryData([
          "searchCapsules",
          queryParams,
          lng,
        ]);
        if (previousData) {
          data = previousData;
        } else {
          data = await searchFetchData(lng, queryParams);
        }
      }
      return data;
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
                    {/* <p className="inline-block text-small-regular text-gray-600">
                    {capsule.date}
                  </p> */}
                    <h1 className="max-lines-3 break-words text-body-bold text-gray-800 3xs:text-base-semibold">
                      {capsule.name}
                    </h1>
                  </Link>
                </div>
                <div className="flex flex-row justify-between">
                  <div className="flex space-x-2 text-subtle-medium text-gray-500">
                    <button className="group">
                      <div className="flex items-center space-x-1">
                        <svg
                          id="favorite_black_18dp"
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          className="transition duration-200 group-hover:fill-gigas-700"
                          fill="#9f9f9f"
                        >
                          <path
                            id="패스_14"
                            data-name="패스 14"
                            d="M0,0H16V16H0Z"
                            fill="none"
                          />
                          <path
                            id="패스_15"
                            data-name="패스 15"
                            d="M8,13.35l-.87-.745C4.04,9.971,2,8.234,2,6.1A3.174,3.174,0,0,1,5.3,3,3.691,3.691,0,0,1,8,4.179,3.691,3.691,0,0,1,10.7,3,3.174,3.174,0,0,1,14,6.1c0,2.132-2.04,3.869-5.13,6.509Z"
                          />
                        </svg>
                        <p className="transition duration-200 group-hover:text-gigas-700">
                          0
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center space-x-1 3xs:hidden">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                      >
                        <path
                          id="패스_17"
                          data-name="패스 17"
                          d="M12.8,2H3.2A1.2,1.2,0,0,0,2,3.2V14l2.4-2.4h8.4A1.2,1.2,0,0,0,14,10.4V3.2A1.2,1.2,0,0,0,12.8,2Z"
                          transform="translate(-2 -2)"
                          fill="#9f9f9f"
                        />
                      </svg>
                      <p>0</p>
                    </div>
                  </div>
                  <div className="truncate-70">
                    <DisplayCapsuleOneTag tags={capsule.tagId} lng={lng} />
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
