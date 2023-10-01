import { getCurrentMonthForSearch } from "@/lib/search-date-string";
import { perPageEnum, cacheTimeEnum, sortEnum } from "@/lib/enums";

const API_URI = process.env.APP_SERVER_URL || "";
export async function arrivalFetchData(
  lng: string,
  searchParams?: Record<string, string>,
) {
  const params = new URLSearchParams(searchParams);
  const date = params.get("date") || getCurrentMonthForSearch();
  const sort = params.get("sort") || sortEnum.DESC;

  const response = await fetch(
    API_URI +
      `/api/capsules?lng=${lng}&startDate=${date}&limit=${perPageEnum.MEDIUM}&blankimg=1&sort=${sort}`,
    {
      method: "GET",
      next: { revalidate: cacheTimeEnum.FIVE_MINUTES },
    },
  );
  const data = await response.json();
  return data;
}

export async function searchFetchData(
  lng: string,
  searchParams: Record<string, string>,
) {
  const params = new URLSearchParams(searchParams);

  const response = await fetch(
    API_URI + `/api/capsules?lng=${lng}&showDetailImg=1&${params.toString()}`,
    {
      method: "GET",
      next: { revalidate: cacheTimeEnum.FIVE_MINUTES },
    },
  );
  const data = await response.json();
  return data;
}

export async function capsuleFetchData(id: string, lng: string) {
  const response = await fetch(API_URI + `/api/capsules/${id}?lng=${lng}`, {
    method: "GET",
    next: { revalidate: cacheTimeEnum.FIVE_MINUTES },
  });
  const data = await response.json();
  return data;
}
