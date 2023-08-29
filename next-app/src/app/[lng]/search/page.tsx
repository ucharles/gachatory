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
import { ICapsuleToy } from "@/lib/models/capsule-model";
import { setDisplayImg } from "@/lib/set-display-img";
import SearchForm from "@/app/[lng]/components/search-form-copy";
import Pagination from "@/app/[lng]/components/pagination";
import SearchLimit from "@/app/[lng]/components/search-limit";
import { useTranslation } from "@/app/i18n";

const IMAGE_URI = process.env.IMAGE_SERVER_URL || "";
const API_URI = process.env.APP_SERVER_URL || "";

async function fetchData(lng: string, searchParams: Record<string, string>) {
  const params = new URLSearchParams(searchParams);

  const response = await fetch(
    API_URI + `/api/capsules?lng=${lng}&${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
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
  const { t } = await useTranslation(params.lng, "search");

  let data: any = null;

  data = await fetchData(params.lng, queryParams);
  setDisplayImg(data.capsules, true);
  // setLanguage(data.capsules, params.lng);

  return (
    <div>
      <h1>{t("title")}</h1>
      <div>
        <SearchForm lng={params.lng} />
        <SearchLimit lng={params.lng} />
      </div>
      {data ? (
        <div>
          <h1>{t("result")}</h1>
          <h2>
            {t("total-count")}: {data.totalCount}
          </h2>
          <Pagination total={data.totalCount} />
          <ul>
            {data.capsules.map((capsule: ICapsuleToy) => {
              return capsule.display_img ? (
                <li key={capsule._id}>
                  <Link href={"/capsule/" + capsule._id}>
                    <img
                      src={IMAGE_URI + capsule.display_img}
                      alt={capsule.name}
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
