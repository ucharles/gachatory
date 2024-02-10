"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  useQueryClient,
  useMutation,
  useInfiniteQuery,
} from "@tanstack/react-query";

import { useInView } from "react-intersection-observer";

import { fetchLikedData } from "@/lib/fetch-data";
import { sortEnum } from "@/lib/enums";
import { useEffect } from "react";
import { translate } from "@/app/i18n/client";
import { convertToLocalTime } from "@/lib/date-converter";
import { updateLikes } from "@/lib/updateLikes";

import LikedCapsuleSkeleton from "./LikedCapsuleSkeleton";

interface LikedCapsulesListItemProps {
  lng: string;
  queryKey: any[];
  searchParams?: Record<string, string>;
}
export default function LikedCapsulesListItem({
  lng,
  queryKey,
  searchParams,
}: LikedCapsulesListItemProps) {
  const { data: session } = useSession({
    required: false,
    onUnauthenticated() {},
  });

  const queryClient = useQueryClient();
  const { t } = translate(lng, "like");

  const { ref, inView } = useInView();

  const sortOrder = searchParams?.["sortOrder"] || sortEnum.DESC;
  const sortBy = searchParams?.["sortBy"] || "like";
  const name = searchParams?.["name"] || "";

  function updateLikedData(capsuleId: string) {
    if (!session) return;

    updateLikes(queryClient, "likedCapsules", capsuleId);

    setTimeout(async () => {
      const response = await fetch(`/api/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          capsuleId: capsuleId,
        }),
      });
      const data = await response.json();
      console.log(data);
    }, 500);
  }

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
      const page = pageParam.toString();
      const data = await fetchLikedData(
        lng,
        "10",
        sortOrder,
        sortBy,
        name,
        page,
      );
      return data;
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.totalCount - 10 * lastPage.page > 0
          ? lastPage.page + 1
          : undefined;
      },
    },
  );

  const { mutateAsync: updateLikeMutation } = useMutation({
    mutationFn: async (capsuleId: string) => {
      updateLikedData(capsuleId);
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage]);

  return (
    <>
      {error ? (
        <div className="flex h-96 items-center justify-center">
          <p className="text-heading2-bold">Error</p>
        </div>
      ) : null}
      {status === "success" && (
        <ul className="grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-2">
          {data?.pages?.length ?? 0 > 0 ? (
            data?.pages?.map((page: any) => {
              return page.likes?.map((like: any) => (
                <li key={like._id}>
                  <div className="flex h-28 justify-between space-x-6">
                    <div className="flex basis-1/3 items-center justify-center overflow-hidden rounded-lg bg-bg-footer">
                      <Link href={`/${lng}/capsule/${like.capsuleId._id}`}>
                        <Image
                          src={`${like.capsuleId.display_img}`}
                          alt={like.capsuleId.name}
                          width={200}
                          height={200}
                          className={`scale-125 object-center transition duration-300 hover:translate-y-0 hover:scale-100 hover:opacity-90`}
                        />
                      </Link>
                    </div>
                    <div className="flex basis-2/3 justify-between space-x-6">
                      <div className="space-y-4">
                        <p className="max-lines-2 break-words text-base-semibold text-gray-800">
                          <Link href={`/${lng}/capsule/${like.capsuleId._id}`}>
                            {like.capsuleId.name}
                          </Link>
                        </p>
                        <div className="flex space-x-4 text-gray-600">
                          <div className="space-y-1">
                            <p className="text-small-regular">
                              {t("release-date")}
                            </p>
                            <p className="text-small-regular">{t("liked")}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-small-regular">
                              {like.capsuleId.date}
                            </p>
                            <p className="text-small-regular">
                              {convertToLocalTime(like.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <button
                          className="m-0 p-0 text-xl text-gray-600"
                          onClick={async () => {
                            try {
                              await updateLikeMutation(like.capsuleId._id);
                            } catch (error) {
                              console.log(error);
                            }
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ));
            })
          ) : (
            <div className="space-y-2">
              <p className="text-heading4-bold">{t("no-liked-message-1")}</p>
              <p>{t("no-liked-message-2")}</p>
            </div>
          )}
        </ul>
      )}
      {isFetching && !isFetchingNextPage && (
        <LikedCapsuleSkeleton isFirst={true} />
      )}
      <div ref={ref}>{isFetchingNextPage && <LikedCapsuleSkeleton />}</div>
    </>
  );
}
