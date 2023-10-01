"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ICapsuleToy } from "@/lib/models/capsule-model";
import { cacheTimeEnum } from "@/lib/enums";
import Link from "next/link";
import Image from "next/image";
import { translate } from "@/app/i18n/client";
import ImageGallery from "./image-gallery";
import DisplayCapsuleTags from "./display-capsule-tag";
import { capsuleFetchData } from "@/lib/fetch-data";

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
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery(
    queryKey,
    async () => {
      const data: ICapsuleToy = await queryClient.fetchQuery(
        ["capsule", id, lng],
        () => {
          capsuleFetchData(id, lng);
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

  return (
    <>
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
          <div className="p-5">
            <h1 className="pb-5 text-heading2-bold sm:hidden md:hidden lg:hidden xl:hidden">
              {data.name}
            </h1>
            <div className="flex justify-center rounded-md border-2 border-gigas-200 shadow-sm">
              <Image src={data.img} alt={data.name} width={560} height={560} />
            </div>
            <ImageGallery detail_img={data.detail_img} />
          </div>
          <div className="p-5">
            <h1 className="pb-5 text-heading2-bold fold:hidden 3xs:hidden 2xs:hidden xs:hidden">
              {data.name}
            </h1>
            {data.originalName ? (
              <p className="pb-5 font-NotoSansJP text-body-medium text-gray-500">
                {data.originalName}
              </p>
            ) : null}
            <p className="pb-5 text-body-medium">
              {t("price")}: {data.price}
              {t("yen")}
            </p>
            <p className="pb-5 text-body-medium">
              {t("release-date")}: {data.date}
            </p>
            {data.tagId?.length > 0 ? (
              <div className="pb-3">
                <DisplayCapsuleTags tags={data.tagId} lng={lng} />
              </div>
            ) : null}
            <p className="pb-5 text-body-medium">{data.description}</p>
            <p className="text-body-small pb-5 text-gray-500 underline">
              <Link href={data.detail_url} as={data.detail_url} target="_blank">
                {t("site-link")}
              </Link>
            </p>
          </div>
        </>
      ) : null}
    </>
  );
}

export default CapsuleInfo;
