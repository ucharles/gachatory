// in server component can get search params like this
// https://www.reddit.com/r/nextjs/comments/10ut3k0/how_to_get_query_parameters_in_nextjs_13/

// export default function Page({
//   params,
//   searchParams,
//   }: {
//   params: { slug: string }
//   searchParams: { [key: string]: string | string[] | undefined }
//   }) {
//   return <h1>My Page</h1>
//   }

import Link from "next/link";
import Image from "next/image";
import { ICapsuleToy } from "@/lib/models/capsule-model";
import { setDisplayImg } from "@/lib/set-display-img";
import SearchForm from "@/app/[lng]/components/search-form-copy";
import Pagination from "@/app/[lng]/components/pagination";
import SearchLimit from "@/app/[lng]/components/search-limit";
import { translate } from "@/app/i18n";
import { cacheTimeEnum } from "@/lib/enums";

const IMAGE_URI = process.env.IMAGE_SERVER_URL || "";
const API_URI = process.env.APP_SERVER_URL || "";

async function fetchData(lng: string, searchParams: Record<string, string>) {
  const params = new URLSearchParams(searchParams);

  const response = await fetch(
    API_URI + `/api/capsules?lng=${lng}&${params.toString()}`,
    {
      method: "GET",
      next: { revalidate: cacheTimeEnum.FIVE_MINUTES },
    }
  );
  const data = await response.json();
  return data;
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { lng: string };
  searchParams: { param1: string; param2: string };
}) {
  const queryParams = searchParams;
  const { t } = await translate(params.lng, "search");

  let data: any = null;

  data = await fetchData(params.lng, queryParams);
  setDisplayImg(data.capsules, true);
  // setLanguage(data.capsules, params.lng);

  return (
    <div className="p-3">
      <h1 className="text-heading3-bold">{t("title")}</h1>
      <div className="pt-5 pb-5">
        <SearchForm lng={params.lng} />
      </div>
      {data ? (
        <div>
          <div className="flex justify-between">
            <div className="flex space-x-5">
              <h1 className="text-heading3-bold ">{t("result")}</h1>
              <h2 className="text-heading4-medium self-center">
                {t("total-count")}: {data.totalCount}
              </h2>
            </div>
            <div className="self-center">
              <SearchLimit lng={params.lng} />
            </div>
          </div>
          <Pagination total={data.totalCount} />
          <ul className="grid grid-cols-4 gap-6 pt-5">
            {data.capsules.map((capsule: ICapsuleToy) => {
              return capsule.display_img ? (
                <li key={capsule._id}>
                  <Link href={"/capsule/" + capsule._id}>
                    <Image
                      src={IMAGE_URI + capsule.display_img}
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
          <Pagination total={data.totalCount} />
        </div>
      ) : (
        <h1>{t("no-result")}</h1>
      )}
    </div>
  );
}
