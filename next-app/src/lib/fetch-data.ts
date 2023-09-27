import { getCurrentMonthForSearch } from "@/lib/search-date-string";
import { perPageEnum, cacheTimeEnum } from "@/lib/enums";

const API_URI = process.env.APP_SERVER_URL || "";
export async function arrivalFetchData(lng: string) {
  const response = await fetch(
    API_URI +
      `/api/capsules?lng=${lng}&startDate=${getCurrentMonthForSearch()}&limit=${
        perPageEnum.MEDIUM
      }&blankimg=1`,
    {
      method: "GET",
      cache: "no-store",
    }
  );
  const data = await response.json();
  return data;
}

export async function searchFetchData(
  lng: string,
  searchParams: Record<string, string>
) {
  const params = new URLSearchParams(searchParams);

  const response = await fetch(
    API_URI + `/api/capsules?lng=${lng}&showDetailImg=1&${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );
  const data = await response.json();
  return data;
}

export async function capsuleFetchData(id: string, lng: string) {
  const response = await fetch(API_URI + `/api/capsules/${id}?lng=${lng}`, {
    method: "GET",
    cache: "no-store",
  });
  const data = await response.json();
  return data;
}
