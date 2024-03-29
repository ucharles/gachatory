"use client";

import React, { useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import Link from "next/link";
import {
  ICapsuleTag,
  ICapsuleTagSubscription,
} from "@/lib/models/capsule-tag-model";
import { capsuleTagPropertyEnum } from "@/lib/enums";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { capsuleFetchData } from "@/lib/fetch-data";
import { translate } from "@/app/i18n/client";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

export const switchTagLng = (tag: ICapsuleTag, lng: string) => {
  switch (lng) {
    case "ja":
      return tag["ja"][0];
    case "ko":
      return tag["ko"][0];
    case "en":
      return tag["en"][0];
    default:
      return null;
  }
};

// property의 우선순위에 따라 태그 순서 재정렬
const propertyMap: { [key: string]: number } = {
  title: capsuleTagPropertyEnum.TITLE,
  character: capsuleTagPropertyEnum.CHARACTER,
  series: capsuleTagPropertyEnum.SERIES,
  author: capsuleTagPropertyEnum.AUTHOR,
  category: capsuleTagPropertyEnum.CATEGORY,
  element: capsuleTagPropertyEnum.ELEMENT,
  brand: capsuleTagPropertyEnum.BRAND,
};

export const propertyOrder = (tag: ICapsuleTag): number => {
  return propertyMap[tag.property] || Number.MAX_SAFE_INTEGER;
};

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="17"
      viewBox="0 0 16 16"
    >
      <path
        className="fill-gigas-700"
        fill="currentColor"
        fillRule="evenodd"
        d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16m3.65-10.857L6.91 9.8L4.35 7.286a.5.5 0 0 0-.7.714l2.909 2.857a.5.5 0 0 0 .7 0l5.091-5a.5.5 0 1 0-.7-.714"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 16 16"
    >
      <path
        className="fill-gigas-700"
        fill="currentColor"
        fillRule="evenodd"
        d="M8 7h3.5a.5.5 0 1 1 0 1H8v3.5a.5.5 0 1 1-1 0V8H3.5a.5.5 0 0 1 0-1H7V3.5a.5.5 0 0 1 1 0zm-.5-7C11.636 0 15 3.364 15 7.5S11.636 15 7.5 15S0 11.636 0 7.5S3.364 0 7.5 0m0 .882a6.618 6.618 0 1 0 0 13.236A6.618 6.618 0 0 0 7.5.882"
      />
    </svg>
  );
}

function setTagSubscribe(tagId: string) {
  console.log("fetchTagSubscribe");
  // react-query의 queryClient를 사용하여 태그 구독 요청
  const request = fetch(`/api/subscriptions/tags`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tagId }),
  }).then((res) => {
    if (!res.ok) {
      // res.ok는 상태 코드가 200~299일 때 true를 반환합니다.
      throw new Error(`Error: ${res.status}`); // 오류를 던지거나 오류 처리 로직 실행
    }
    return res.json(); // 정상 응답 데이터 처리
  });

  return request;
}

function setTagUnsubscribe(tagId: string) {
  console.log("fetchTagUnsubscribe");
  const request = fetch(`/api/subscriptions/tags/${tagId}/unsubscribe`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => {
    if (!res.ok) {
      // res.ok는 상태 코드가 200~299일 때 true를 반환합니다.
      throw new Error(`Error: ${res.status}`); // 오류를 던지거나 오류 처리 로직 실행
    }
    return res.json(); // 정상 응답 데이터 처리
  });

  return request;
}

interface ITag {
  _id: string;
  ja: object;
  ko: object;
  en: object;
  property: string;
  linkCount: number;
  createdAt: string;
  subscription: boolean;
}

interface ICapsuleData {
  tagId: ITag[];
  // 여기에 ICapsuleData의 다른 속성들을 추가할 수 있습니다.
}

function SubscribeTagButton({
  subscription,
  tagId,
  queryKey,
  lng,
}: {
  subscription: boolean;
  tagId: string;
  queryKey: any[];
  lng: string;
}) {
  const { t } = translate(lng, "tags");
  const { toast } = useToast();
  console.log(
    "Component: SubscribeTagButton... subscription",
    subscription,
    "tagId",
    tagId,
  );
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching } = useQuery({
    queryKey: queryKey,
    queryFn: () => capsuleFetchData(queryKey[1], queryKey[2]),
  });

  // 실제 구독 상태를 확인하고 버튼의 UI를 업데이트합니다.
  const currentSubscriptionStatus = data?.tagId.find(
    (tag: any) => tag._id === tagId,
  )?.subscription;

  const { mutate } = useMutation({
    mutationFn: (tagId: string) =>
      currentSubscriptionStatus
        ? setTagUnsubscribe(tagId)
        : setTagSubscribe(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries(queryKey);
      queryClient.invalidateQueries(["subscribedTags"]);
      currentSubscriptionStatus
        ? toast({ description: t("subscriptionSuccess") })
        : toast({ description: t("unsubscriptionSuccess") });
    },
    onMutate: async (tagId: string) => {
      // 현재 쿼리 상태를 백업
      await queryClient.cancelQueries(queryKey);
      const previousData = queryClient.getQueryData(queryKey);

      // 낙관적 업데이트를 적용 (UI를 미리 업데이트)
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            tagId: oldData.tagId.map((tag: any) => {
              if (tag._id === tagId) {
                return { ...tag, subscription: !currentSubscriptionStatus };
              }
              return tag;
            }),
          };
        }
        return oldData;
      });

      // onError에서 롤백을 위해 이전 상태 반환
      return { previousData };
    },
    onError: (error, tagId, context) => {
      // 에러가 발생했을 때 이전 상태로 롤백
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast({
        title: t("subscriptionError"),
        description: t("subscriptionErrorMessage"),
        variant: "destructive",
      });
    },
    onSettled: () => {
      // 성공 또는 실패 후 최신 데이터로 새로고침
      queryClient.invalidateQueries(queryKey);
    },
  });

  const { data: session } = useSession({
    required: false,
    onUnauthenticated() {},
  });

  let handleButtonClick = session
    ? () => mutate(tagId)
    : () => {
        toast({
          title: t("loginRequired"),
          description: t("loginRequiredMessage"),
          variant: "destructive",
          action: (
            <Link href="/auth/signin">
              <ToastAction altText="Login">{t("login")}</ToastAction>
            </Link>
          ),
        });
      };

  return (
    <button
      title={currentSubscriptionStatus ? t("unsubscribe") : t("subscribe")}
      onClick={() => handleButtonClick()}
    >
      {currentSubscriptionStatus ? <CheckIcon /> : <PlusIcon />}
    </button>
  );
}

function DisplayCapsuleTags({
  tags,
  lng,
  queryKey,
}: {
  tags: Array<ICapsuleTagSubscription>;
  lng: string;
  queryKey: any[];
}) {
  // 태그를 property 우선순위에 따라 정렬
  const sortedTags = useMemo(() => {
    return [...tags].sort((a, b) => propertyOrder(a) - propertyOrder(b));
  }, [tags]);

  // const sortedTags = tags.sort((a, b) => propertyOrder(a) - propertyOrder(b));
  console.log("DisplayCapsuleTags: sortedTags", sortedTags);

  console.log("Component: DisplayCapsuleTags");

  return (
    <div className="flex flex-wrap">
      {sortedTags.map((tag, index) => (
        <p
          key={tag._id}
          className="mb-2 mr-2 flex justify-center space-x-1 rounded-full border border-gigas-700 px-2 py-1 text-small-regular font-semibold text-gigas-700"
        >
          <Link href={`/${lng}/search?tag=${tag._id}`} key={index}>
            <span>{switchTagLng(tag, lng)}</span>
          </Link>
          <SubscribeTagButton
            subscription={tag.subscription}
            tagId={tag._id}
            queryKey={queryKey}
            lng={lng}
          />
        </p>
      ))}
    </div>
  );
}

export function DisplayCapsuleOneTag({
  tags,
  lng,
}: {
  tags: Array<ICapsuleTag>;
  lng: string;
}) {
  tags.sort((a, b) => propertyOrder(a) - propertyOrder(b));

  return (
    <>
      {tags.length > 0 ? (
        <Link href={`/${lng}/search?tag=${tags[0]._id}`}>
          <div
            className="rounded-2xl border border-gigas-700 px-2 py-1 text-small-semibold text-gigas-700 transition duration-200 hover:bg-gigas-700 hover:text-background-white"
            key={tags[0]._id}
          >
            <p className="truncate">{switchTagLng(tags[0], lng)}</p>
          </div>
        </Link>
      ) : null}
    </>
  );
}

export default DisplayCapsuleTags;
