// server component

import Link from "next/link";
import { cookies } from "next/headers";

import { translate } from "@/app/i18n";
import DisplayCapsuleTags from "./display-capsule-tag";
import { capsuleFetchData } from "@/lib/fetch-data";
import getQueryClient from "@/components/Providers/getQueryClient";

import CapsuleLinkCopyButton from "./CapsuleLinkCopyButton";
import LikeBigButtonSet from "./LikeBigButtonSet";

import CapsuleImageCarousel from "@/components/capsules/CapsuleImageCarousel";

export default async function CapsuleInfo({
  lng,
  queryKey,
  id,
}: {
  lng: string;
  queryKey: any[];
  id: string;
}) {
  const { t } = await translate(lng, "translation");

  const queryClient = getQueryClient();
  const cookie = cookies();
  const data = await queryClient.fetchQuery({
    queryKey: ["capsule", id, lng],
    queryFn: () => {
      return capsuleFetchData(id, lng, cookie);
    },
  });

  return (
    <>
      {data ? (
        <>
          <div className="grid-left">
            <div className="pb-4 sm:hidden">
              <div className="flex items-center justify-between">
                <p className="text-gray-400">{t("product-info")}</p>
                <CapsuleLinkCopyButton lng={lng} />
              </div>
              <h1 className="pt-2 text-heading3-bold">{data.name}</h1>
              {data.originalName ? (
                <p className="pt-2 font-NotoSansJP text-base-medium text-gray-500">
                  {data.originalName}
                </p>
              ) : null}
            </div>
            <CapsuleImageCarousel data={data} />
            <div className="sm:hidden">
              {data.tagId?.length > 0 ? (
                <div className="pt-4">
                  <DisplayCapsuleTags
                    tags={data.tagId}
                    lng={lng}
                    queryKey={queryKey}
                  />
                </div>
              ) : null}
            </div>
          </div>
          <div className="grid-right">
            <div className="hidden sm:block">
              <div className="flex items-center justify-between pb-2">
                <p className="text-gray-400">{t("product-info")}</p>
                <CapsuleLinkCopyButton lng={lng} />
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
                  <DisplayCapsuleTags
                    lng={lng}
                    tags={data.tagId}
                    queryKey={queryKey}
                  />
                </div>
              ) : null}
            </div>
            <div className="hidden space-y-4 pb-10 text-small-medium text-gray-800 sm:block">
              <div className="flex flex-row">
                <div className="basis-1/6">{t("release-date")}</div>
                <div className="flex basis-5/6">
                  <p className="basis-1/2">{data.date?.join(", ")}</p>
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
            <LikeBigButtonSet lng={lng} queryKey={queryKey} id={id} />
            <div className="space-y-4 pt-6 text-small-medium text-gray-800 sm:hidden">
              <div className="flex justify-between">
                <div className="basis-1/2">{t("release-date")}</div>
                <div className="text-end">
                  <p>{data.date?.join(", ")}</p>
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
