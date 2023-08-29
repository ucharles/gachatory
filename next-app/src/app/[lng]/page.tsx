import { ICapsuleToy } from "@/lib/models/capsule-model";
import Link from "next/link";
import { getCurrentMonthForSearch } from "@/lib/search-date-string";
import { setDisplayImg } from "@/lib/set-display-img";
import { useTranslation } from "../i18n";

const IMAGE_URI = process.env.IMAGE_SERVER_URL || "";
const API_URI = process.env.APP_SERVER_URL || "";

async function fetchData(lng: string) {
  const response = await fetch(
    API_URI +
      `/api/capsules?lng=${lng}&startDate=${getCurrentMonthForSearch()}`,
    {
      method: "GET",
      cache: "no-store",
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
  const { t } = await useTranslation(lng);

  // set display_img
  setDisplayImg(data.capsules, false);

  return (
    <div>
      <h1>
        {t("new-arrival")} ({getCurrentMonthForSearch()})
      </h1>
      <ul>
        {data.capsules.map((capsule: ICapsuleToy) => {
          return capsule.display_img ? (
            <li key={capsule._id}>
              <Link href={"/" + lng + "/capsule/" + capsule._id}>
                <img src={IMAGE_URI + capsule.display_img} alt={capsule.name} />
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
