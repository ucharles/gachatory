"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ICapsuleToy } from "@/lib/models/capsule-model";
import { arrivalFetchData, searchFetchData } from "@/lib/fetch-data";
import { cacheTimeEnum } from "@/lib/enums";

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
    <ul className="grid grid-cols-4 gap-6">
      {data?.capsules.map((capsule: ICapsuleToy) => {
        return capsule.display_img ? (
          <li key={capsule._id}>
            <Link href={`/${lng}/capsule/${capsule._id}`}>
              <Image
                src={capsule.display_img}
                alt={capsule.name}
                width={300}
                height={300}
                unoptimized={true}
              />
              <h1>{capsule.name}</h1>
              <p>{capsule.date}</p>
            </Link>
          </li>
        ) : null;
      })}
    </ul>
  );
}

export default CapsuleCards;
