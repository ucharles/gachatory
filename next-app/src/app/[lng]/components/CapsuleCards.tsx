"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ICapsuleToy } from "@/lib/models/capsule-model";
import { arrivalFetchData, searchFetchData } from "@/lib/fetch-data";
import { cacheTimeEnum } from "@/lib/enums";
import LikeButton from "./LikeButton";
import CommentButton from "./CommentButton";

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
      if (pageName === "arrival") {
        data = await arrivalFetchData(lng);
      } else if (pageName === "search" && queryParams) {
        data = await searchFetchData(lng, queryParams);
      }
      return data;
    },
    {
      cacheTime: cacheTimeEnum.FIVE_MINUTES * 1000,
      staleTime: cacheTimeEnum.ONE_MINUTE * 1000,
      refetchOnMount: false,
    }
  );

  // 좋아요 기능 추가 시 useMutation을 사용하여 캐시 업데이트

  return (
    <ul className="grid 2xl:grid-cols-4 xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-4 sm:grid-cols-2 xs:grid-cols-2 2xs:grid-cols-1 3xs:grid-cols-1 fold:grid-cols-1 gap-4">
      {data?.capsules?.map((capsule: ICapsuleToy) => {
        return capsule.display_img ? (
          <li key={capsule._id} className="border-2 rounded-md shadow-sm">
            <div className="divide-y">
              <div className="relative overflow-hidden h-72 fold:h-52">
                <Link href={`/${lng}/capsule/${capsule._id}`}>
                  <Image
                    src={capsule.display_img}
                    alt={capsule.name}
                    width={400}
                    height={400}
                    className="scale-110 translate-y-4 hover:opacity-80 hover:scale-100 hover:translate-y-0 transition duration-300"
                  />
                  <CommentButton count={0} />
                </Link>
                <LikeButton like={false} count={0} />
              </div>
              <div className="px-4 pt-3 pb-4">
                <Link href={`/${lng}/capsule/${capsule._id}`}>
                  <h1>{capsule.name}</h1>
                  <p className="mt-3 inline-block bg-gray-200 rounded-full px-3 py-1 text-small-regular text-gray-700">
                    {capsule.date}
                  </p>
                </Link>
              </div>
            </div>
          </li>
        ) : null;
      })}
    </ul>
  );
}

export default CapsuleCards;
