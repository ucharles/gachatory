"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { fetchLikedData } from "@/lib/fetch-data";
import { cacheTimeEnum, sortEnum } from "@/lib/enums";
import { useEffect } from "react";
import { translate } from "@/app/i18n/client";
import { convertToLocalTime } from "@/lib/date-converter";

interface LikedCapsulesListItemProps {
  lng: string;
  queryKey: string[];
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

  const sortRecent = searchParams?.["recent-order"] || sortEnum.DESC;
  const sortLike = searchParams?.["like-order"] || sortEnum.DESC;

  function updateSortRecentData() {
    queryClient.setQueryData(queryKey, (oldData: any) => {
      const newData = oldData.likes.sort((a: any, b: any) => {
        if (sortRecent === sortEnum.DESC) {
          return (
            new Date(b.capsuleId.dateISO[0]).getTime() -
            new Date(a.capsuleId.dateISO[0]).getTime()
          );
        } else {
          return (
            new Date(a.capsuleId.dateISO[0]).getTime() -
            new Date(b.capsuleId.dateISO[0]).getTime()
          );
        }
      });
      return { likes: newData };
    });
  }

  function updateSortLikedData() {
    queryClient.setQueryData(queryKey, (oldData: any) => {
      const newData = oldData.likes.sort((a: any, b: any) => {
        if (sortLike === sortEnum.DESC) {
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        } else {
          return (
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          );
        }
      });
      return { likes: newData };
    });
  }

  useEffect(() => {
    updateSortRecentData();
  }, [sortRecent]);

  useEffect(() => {
    updateSortLikedData();
  }, [sortLike]);

  function updateLikedData(capsuleId: string) {
    if (!session) return;

    queryClient.setQueryData(queryKey, (oldData: any) => {
      const newData = oldData.likes.filter(
        (like: any) => like.capsuleId._id !== capsuleId,
      );
      return { likes: newData };
    });

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

  const { data, isLoading, isError } = useQuery(
    queryKey,
    async () => {
      const data = await queryClient.fetchQuery(queryKey, () => {
        console.log("capsuleFetchData");
        return fetchLikedData(lng, "20");
      });
      return data;
    },
    {
      cacheTime: cacheTimeEnum.FIVE_MINUTES * 1000,
      staleTime: cacheTimeEnum.ONE_MINUTE * 1000,
      refetchOnMount: true,
    },
  );

  const { mutateAsync: updateLikeMutation } = useMutation({
    mutationFn: async (capsuleId: string) => {
      updateLikedData(capsuleId);
    },
  });

  return (
    <>
      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
        </div>
      ) : null}
      {isError ? (
        <div className="flex h-96 items-center justify-center">
          <p className="text-heading2-bold">Error</p>
        </div>
      ) : null}
      <ul className="grid grid-cols-2 gap-x-10 gap-y-10 fold:grid-cols-1 3xs:grid-cols-1 2xs:grid-cols-1">
        {data?.likes.length > 0 ? (
          data.likes.map((like: any) => (
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
          ))
        ) : (
          <div className="space-y-2">
            <p className="text-heading4-bold">{t("no-liked-message-1")}</p>
            <p>{t("no-liked-message-2")}</p>
          </div>
        )}
      </ul>
    </>
  );
}
