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
        }
      );
      return data;
    },
    {
      cacheTime: cacheTimeEnum.FIVE_MINUTES * 1000,
      staleTime: cacheTimeEnum.ONE_MINUTE * 1000,
      refetchOnMount: false,
    }
  );

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : null}
      {isError ? (
        <div className="flex justify-center items-center h-96">
          <p className="text-heading2-bold">{t("error")}</p>
        </div>
      ) : null}
      {data ? (
        <>
          <div className="p-5">
            <div className="flex justify-center border border-black ">
              <Image src={data.img} alt={data.name} width={560} height={560} />
            </div>
            <ImageGallery detail_img={data.detail_img} />
          </div>
          <div className="p-5">
            <h1 className="text-heading2-bold pb-5">{data.name}</h1>
            {data.originalName ? (
              <p className="text-body-medium pb-5 text-gray-500 font-NotoSansJP">
                {data.originalName}
              </p>
            ) : null}
            <p className="text-body-medium pb-5">
              {t("price")}: {data.price}
              {t("yen")}
            </p>
            <p className="text-body-medium pb-5">
              {t("release-date")}: {data.date}
            </p>
            {data.tagId?.length > 0 ? (
              <div className="pb-3">
                <DisplayCapsuleTags tags={data.tagId} lng={lng} />
              </div>
            ) : null}
            <p className="text-body-medium pb-5">{data.description}</p>
            <p className="text-body-small pb-5 underline text-gray-500">
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
