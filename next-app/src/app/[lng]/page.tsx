import { ICapsuleToy } from "@/lib/models/capsule-model";
import Link from "next/link";
import Image from "next/image";
import { getCurrentMonthForSearch } from "@/lib/search-date-string";
import { setDisplayImg } from "@/lib/set-display-img";
import { translate } from "../i18n";
import { perPageEnum, cacheTimeEnum } from "@/lib/enums";

const IMAGE_URI = process.env.IMAGE_SERVER_URL || "";
const API_URI = process.env.APP_SERVER_URL || "";

async function fetchData(lng: string) {
  const response = await fetch(
    API_URI +
      `/api/capsules?lng=${lng}&startDate=${getCurrentMonthForSearch()}&limit=${
        perPageEnum.MEDIUM
      }&blankimg=1`,
    {
      method: "GET",
      next: { revalidate: cacheTimeEnum.FIVE_MINUTES },
    }
  );
  const data = await response.json();
  return data;
}

export default async function Page({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const data = await fetchData(lng);
  const { t } = await translate(lng);

  // set display_img
  setDisplayImg(data.capsules, false);

  return (
    <div className="p-3">
      <h1 className="text-heading3-bold pb-6">
        {t("new-arrival")} ({getCurrentMonthForSearch()})
      </h1>
      <ul className="grid grid-cols-4 gap-6">
        {data.capsules.map((capsule: ICapsuleToy) => {
          return capsule.display_img ? (
            <li key={capsule._id}>
              <Link href={"/" + lng + "/capsule/" + capsule._id}>
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
    </div>
  );
}
