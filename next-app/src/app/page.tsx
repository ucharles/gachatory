import { ICapsuleToy } from "@/lib/models/capsule-model";
import Link from "next/link";
import { getCurrentMonthForSearch } from "@/lib/search-date-string";
import { setDisplayImg } from "@/lib/set-display-img";

const IMAGE_URI = process.env.IMAGE_SERVER_URL || "";
const API_URI = process.env.APP_SERVER_URL || "";

interface PageProps {
  params: { lng: string };
}

async function fetchData() {
  const response = await fetch(
    API_URI + "/api/capsules?startDate=" + getCurrentMonthForSearch(),
    {
      method: "GET",
    }
  );
  const data = await response.json();
  return data;
}

export default async function Page(params: PageProps) {
  const data = await fetchData();

  // set display_img
  setDisplayImg(data.capsules, false);

  return (
    <div>
      <h1>이번달 신작 ({getCurrentMonthForSearch()})</h1>
      <ul>
        {data.capsules.map((capsule: ICapsuleToy) => {
          return capsule.display_img ? (
            <li key={capsule._id}>
              <Link href={"/capsule/" + capsule._id}>
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
