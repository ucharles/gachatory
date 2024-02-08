"use client";

import Link from "next/link";
import { cookies } from "next/headers";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { translate } from "@/app/i18n/client";

import { ICapsuleToy } from "@/lib/models/capsule-model";
import { capsuleFetchData } from "@/lib/fetch-data";
import { cacheTimeEnum } from "@/lib/enums";

import LoginAlert from "./LoginAlert";

export default function LikeBigButtonSet({
  lng,
  queryKey,
  id,
}: {
  lng: string;
  queryKey: any[];
  id: string;
}) {
  const { t } = translate(lng, "translation");
  const { data: session } = useSession({
    required: false,
    onUnauthenticated() {},
  });
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery(
    queryKey,
    async () => {
      const data: ICapsuleToy = await queryClient.fetchQuery(
        ["capsule", id, lng],
        () => {
          console.log("capsuleFetchData");
          return capsuleFetchData(id, lng);
        },
      );
      return data;
    },
    {
      cacheTime: cacheTimeEnum.FIVE_MINUTES * 1000,
      staleTime: cacheTimeEnum.ONE_MINUTE * 1000,
      refetchOnMount: false,
    },
  );

  const [isLiked, setIsLiked] = useState(data?.like ?? false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isLogginAlert, setIsLogginAlert] = useState(false);

  const fetchLike = async () => {
    if (!session) return;

    setTimeout(async () => {
      const response = await fetch(`/api/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          capsuleId: id,
        }),
      });
      const data = await response.json();
      console.log(data);
    }, 500);
  };

  const getMostRecentData = () => {
    const matchingQueries = queryClient.getQueriesData(["arrivalCapsules"]);

    if (matchingQueries.length > 0) {
      const mostRecentQuery = matchingQueries[0];
      return mostRecentQuery;
    }

    return null;
  };

  function handleLike() {
    // 버튼을 누르면 로그인이 되어있는지 확인하고
    // 로그인이 되어있으면 좋아요를 누른다.
    // 로그인 된 상태에서 좋아요를 누른 경우, 1초간 버튼을 비활성화한다.

    if (session) {
      if (isLikeLoading) return;
      setIsLikeLoading(true);
      setTimeout(() => {
        setIsLikeLoading(false);
      }, 1000);

      setIsLiked(!isLiked);

      queryClient.setQueryData(queryKey, (oldData: any) => {
        return {
          ...oldData,
          like: !oldData.like,
        };
      });

      fetchLike();

      const mostRecentData = getMostRecentData();
      if (mostRecentData) {
        const mostRecentDataQueryKey = mostRecentData[0];

        queryClient.setQueryData(mostRecentDataQueryKey, (oldData: any) => {
          const newPages = oldData.pages.map((page: any) => {
            return {
              ...page,
              capsules: page.capsules.map((capsule: any) => {
                if (capsule._id === id) {
                  return {
                    ...capsule,
                    like: !capsule.like,
                  };
                }
                return capsule;
              }),
            };
          });
          return {
            ...oldData,
            pages: newPages,
          };
        });
      }
    } else {
      // 로그인이 되어있지 않으면 로그인을 하라는 알림을 띄운다.
      // 2초 동안 입력을 받지 않는다.
      if (!isLogginAlert) {
        setIsLogginAlert(true);
        setTimeout(() => {
          setIsLogginAlert(false);
        }, 2000);
      }
    }
  }

  async function handleLikeList() {
    // 좋아요 리스트로 이동
    if (session) {
    } else {
      // 로그인이 되어있지 않으면 로그인을 하라는 알림을 띄운다.
      // 2초 동안 입력을 받지 않는다.
      if (!isLogginAlert) {
        setIsLogginAlert(true);
        setTimeout(() => {
          setIsLogginAlert(false);
        }, 2000);
      }
    }
  }

  return (
    <>
      <LoginAlert lng={lng} isDisplay={isLogginAlert} />

      <div className="flex h-14 space-x-1.5">
        <button
          className={`h-full basis-2/3 rounded-md border border-gigas-600 hover:shadow-md ${
            isLiked ? "bg-gigas-700" : ""
          }`}
          onClick={handleLike}
          disabled={isLikeLoading}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg
              id="favorite_black_18dp"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className={`transition-transform duration-300 ${
                isLiked ? "animate-heartBounce" : ""
              }`}
            >
              <path
                id="패스_14"
                data-name="패스 14"
                d="M0,0H24V24H0Z"
                fill="none"
              />
              <path
                id="패스_15"
                data-name="패스 15"
                d="M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5A5.447,5.447,0,0,1,7.5,3,5.988,5.988,0,0,1,12,5.09,5.988,5.988,0,0,1,16.5,3,5.447,5.447,0,0,1,22,8.5c0,3.78-3.4,6.86-8.55,11.54Z"
                transform="translate(0 0)"
                fill={isLiked ? "#fff" : "#6757d4"}
              />
            </svg>
            <p
              className={`text-base-medium  ${
                isLiked ? "text-white" : "text-gigas-700"
              }`}
            >
              {t("like")}
            </p>
          </div>
        </button>
        {session && (
          <button className="basis-1/3" onClick={handleLikeList}>
            <Link href={`/${lng}/like-list`}>
              <div className="hidden h-full items-center justify-center rounded-md border border-gray-400 hover:shadow-md sm:flex">
                <p className="text-gray-400">{t("go-to-like-list")}</p>
              </div>
              <div className="flex h-full items-center justify-center rounded-md border border-gray-400 hover:shadow-md sm:hidden">
                <p className="text-gray-400">{t("go-to-like")}</p>
              </div>
            </Link>
          </button>
        )}
        {!session && (
          <button className="basis-1/3" onClick={handleLikeList}>
            <div className="hidden h-full items-center justify-center rounded-md border border-gray-400 hover:shadow-md sm:flex">
              <p className="text-gray-400">{t("go-to-like-list")}</p>
            </div>
            <div className="flex h-full items-center justify-center rounded-md border border-gray-400 hover:shadow-md sm:hidden">
              <p className="text-gray-400">{t("go-to-like")}</p>
            </div>
          </button>
        )}
      </div>
    </>
  );
}
