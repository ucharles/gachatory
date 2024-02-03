"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ICapsuleToy } from "@/lib/models/capsule-model";
import { cacheTimeEnum } from "@/lib/enums";
import Link from "next/link";
import Image from "next/image";
import { translate } from "@/app/i18n/client";
import ImageGallery from "./image-gallery";
import DisplayCapsuleTags from "./display-capsule-tag";
import { capsuleFetchData } from "@/lib/fetch-data";
import { useSession } from "next-auth/react";
import LoginAlert from "./LoginAlert";
import SuccessNoti from "./SuccessNoti";

function CapsuleInfo({
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
  const [isCopied, setIsCopied] = useState(false);

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

  async function handleLinkCopy() {
    await navigator.clipboard.writeText(window.location.href);
    // 현재 주소 링크를 복사
    // 복사가 성공하면 isCopied 상태를 true로 업데이트합니다.
    if (!isCopied) {
      setIsCopied(true);
      // 2초 후에 isCopied를 false로 다시 설정하여 풍선이 사라지게 합니다.
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
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
      <SuccessNoti lng={lng} isDisplay={isCopied} msg={"link-copied"} />
      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
        </div>
      ) : null}
      {isError ? (
        <div className="flex h-96 items-center justify-center">
          <p className="text-heading2-bold">{t("error")}</p>
        </div>
      ) : null}
      {data ? (
        <>
          <div>
            <div className="pb-4 sm:hidden">
              <div className="flex items-center justify-between">
                <p className="text-gray-400">{t("product-info")}</p>
                <button onClick={handleLinkCopy}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14.4"
                    height="16"
                    viewBox="0 0 14.4 16"
                  >
                    <path
                      id="share_FILL1_wght400_GRAD0_opsz24"
                      d="M132-864a2.314,2.314,0,0,1-1.7-.7,2.314,2.314,0,0,1-.7-1.7,2.194,2.194,0,0,1,.02-.29,1.471,1.471,0,0,1,.06-.27l-5.64-3.28a2.635,2.635,0,0,1-.76.47,2.323,2.323,0,0,1-.88.17,2.314,2.314,0,0,1-1.7-.7,2.314,2.314,0,0,1-.7-1.7,2.314,2.314,0,0,1,.7-1.7,2.314,2.314,0,0,1,1.7-.7,2.323,2.323,0,0,1,.88.17,2.635,2.635,0,0,1,.76.47l5.64-3.28a1.47,1.47,0,0,1-.06-.27,2.2,2.2,0,0,1-.02-.29,2.315,2.315,0,0,1,.7-1.7,2.315,2.315,0,0,1,1.7-.7,2.315,2.315,0,0,1,1.7.7,2.315,2.315,0,0,1,.7,1.7,2.315,2.315,0,0,1-.7,1.7,2.314,2.314,0,0,1-1.7.7,2.324,2.324,0,0,1-.88-.17,2.635,2.635,0,0,1-.76-.47l-5.64,3.28a1.469,1.469,0,0,1,.06.27,2.195,2.195,0,0,1,.02.29,2.194,2.194,0,0,1-.02.29,1.471,1.471,0,0,1-.06.27l5.64,3.28a2.635,2.635,0,0,1,.76-.47,2.323,2.323,0,0,1,.88-.17,2.314,2.314,0,0,1,1.7.7,2.315,2.315,0,0,1,.7,1.7,2.315,2.315,0,0,1-.7,1.7A2.314,2.314,0,0,1,132-864Z"
                      transform="translate(-120 880)"
                      fill="#a8a8a8"
                    />
                  </svg>
                </button>
              </div>
              <h1 className="pt-2 text-heading3-bold">{data.name}</h1>
              {data.originalName ? (
                <p className="pt-2 font-NotoSansJP text-base-medium text-gray-500">
                  {data.originalName}
                </p>
              ) : null}
              {data.tagId?.length > 0 ? (
                <div className="pt-4">
                  <DisplayCapsuleTags tags={data.tagId} lng={lng} />
                </div>
              ) : null}
            </div>
            <div className="flex justify-center rounded-md border border-gray-300">
              <Image src={data.img} alt={data.name} width={560} height={560} />
            </div>
            <ImageGallery detail_img={data.detail_img} />
          </div>
          <div>
            <div className="hidden sm:block">
              <div className="flex items-center justify-between pb-2">
                <p className="text-gray-400">{t("product-info")}</p>
                <div className="">
                  <button onClick={handleLinkCopy}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14.4"
                      height="16"
                      viewBox="0 0 14.4 16"
                    >
                      <path
                        id="share_FILL1_wght400_GRAD0_opsz24"
                        d="M132-864a2.314,2.314,0,0,1-1.7-.7,2.314,2.314,0,0,1-.7-1.7,2.194,2.194,0,0,1,.02-.29,1.471,1.471,0,0,1,.06-.27l-5.64-3.28a2.635,2.635,0,0,1-.76.47,2.323,2.323,0,0,1-.88.17,2.314,2.314,0,0,1-1.7-.7,2.314,2.314,0,0,1-.7-1.7,2.314,2.314,0,0,1,.7-1.7,2.314,2.314,0,0,1,1.7-.7,2.323,2.323,0,0,1,.88.17,2.635,2.635,0,0,1,.76.47l5.64-3.28a1.47,1.47,0,0,1-.06-.27,2.2,2.2,0,0,1-.02-.29,2.315,2.315,0,0,1,.7-1.7,2.315,2.315,0,0,1,1.7-.7,2.315,2.315,0,0,1,1.7.7,2.315,2.315,0,0,1,.7,1.7,2.315,2.315,0,0,1-.7,1.7,2.314,2.314,0,0,1-1.7.7,2.324,2.324,0,0,1-.88-.17,2.635,2.635,0,0,1-.76-.47l-5.64,3.28a1.469,1.469,0,0,1,.06.27,2.195,2.195,0,0,1,.02.29,2.194,2.194,0,0,1-.02.29,1.471,1.471,0,0,1-.06.27l5.64,3.28a2.635,2.635,0,0,1,.76-.47,2.323,2.323,0,0,1,.88-.17,2.314,2.314,0,0,1,1.7.7,2.315,2.315,0,0,1,.7,1.7,2.315,2.315,0,0,1-.7,1.7A2.314,2.314,0,0,1,132-864Z"
                        transform="translate(-120 880)"
                        fill="#a8a8a8"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <h1 className="text-heading3-bold">{data.name}</h1>
              {data.originalName ? (
                <p className="pt-1.5 font-NotoSansJP text-base-medium text-gray-500">
                  {data.originalName}
                </p>
              ) : null}
              <div className="mb-4 mt-6 h-[1px] bg-gray-200"></div>
            </div>
            <p className="pb-6 text-body-medium">{data.description}</p>
            <div className="hidden sm:block">
              {data.tagId?.length > 0 ? (
                <div className="pb-6">
                  <DisplayCapsuleTags tags={data.tagId} lng={lng} />
                </div>
              ) : null}
            </div>
            <div className="hidden space-y-4 pb-10 text-small-medium text-gray-800 sm:block">
              <div className="flex flex-row">
                <div className="basis-1/6">{t("release-date")}</div>
                <div className="flex basis-5/6">
                  <p className="basis-1/2">{data.date.join(", ")}</p>
                  <p className="text-end text-subtle-medium text-gray-400">
                    {t("date-explain")}
                  </p>
                </div>
              </div>
              <div className="flex flex-row">
                <p className="basis-1/6">{t("brand")}</p>
                <p className="basis-5/6">{data.brand}</p>
              </div>
              <div className="flex flex-row">
                <p className="basis-1/6">{t("price")}</p>
                <p className="basis-5/6">
                  {data.price}
                  {t("yen")}
                </p>
              </div>
            </div>
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
            </div>
            <div className="space-y-4 pt-6 text-small-medium text-gray-800 sm:hidden">
              <div className="flex justify-between">
                <div className="basis-1/2">{t("release-date")}</div>
                <div className="text-end">
                  <p>{data.date.join(", ")}</p>
                  <p className="text-subtle-medium text-gray-400">
                    {t("date-explain")}
                  </p>
                </div>
              </div>
              <div className="flex justify-between">
                <p className="">{t("brand")}</p>
                <p className="">{data.brand}</p>
              </div>
              <div className="flex justify-between">
                <p className="">{t("price")}</p>
                <p className="">
                  {data.price}
                  {t("yen")}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-6 sm:pt-32">
              <p className="text-small-medium text-gray-400 underline">
                <Link
                  href={data.detail_url}
                  as={data.detail_url}
                  target="_blank"
                >
                  {t("site-link")}
                </Link>
              </p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 14 14"
              >
                <path
                  id="open_in_new_FILL0_wght400_GRAD0_opsz24"
                  d="M121.556-826a1.5,1.5,0,0,1-1.1-.457,1.5,1.5,0,0,1-.457-1.1v-10.889a1.5,1.5,0,0,1,.457-1.1,1.5,1.5,0,0,1,1.1-.457H127v1.556h-5.444v10.889h10.889V-833H134v5.444a1.5,1.5,0,0,1-.457,1.1,1.5,1.5,0,0,1-1.1.457Zm3.656-4.122-1.089-1.089,7.233-7.233h-2.8V-840H134v5.444h-1.556v-2.8Z"
                  transform="translate(-120 840)"
                  fill="#9ca3af"
                />
              </svg>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

export default CapsuleInfo;
