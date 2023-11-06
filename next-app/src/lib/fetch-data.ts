import { getCurrentMonthForSearch } from "@/lib/search-date-string";
import { perPageEnum, cacheTimeEnum, sortEnum } from "@/lib/enums";
import { cookies } from "next/headers";

const API_URI = process.env.APP_SERVER_URL || "";
export async function arrivalFetchData(
  lng: string,
  searchParams?: Record<string, string>,
) {
  const params = new URLSearchParams(searchParams);
  const date = params.get("date") || getCurrentMonthForSearch();
  const sort = params.get("sort") || sortEnum.DESC;
  const page = params.get("page") || "1";

  const response = await fetch(
    API_URI +
      `/api/capsules?lng=${lng}&startDate=${date}&limit=${perPageEnum.SMALL}&sort=${sort}&page=${page}`,
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
  searchParams?: Record<string, string>,
  cookies?: any,
) {
  const params = new URLSearchParams(searchParams);

  const response = await fetch(
    API_URI +
      `/api/capsules?lng=${lng}&showDetailImg=1&sortField=date&${params.toString()}`,
    {
      method: "GET",
      next: { revalidate: cacheTimeEnum.FIVE_MINUTES },
      headers: {
        cookie: cookies,
      },
    },
  );
  const data = await response.json();
  return data;
}

export async function capsuleFetchData(id: string, lng: string, cookies?: any) {
  const response = await fetch(API_URI + `/api/capsules/${id}?lng=${lng}`, {
    method: "GET",
    next: { revalidate: cacheTimeEnum.FIVE_MINUTES },
    headers: {
      cookie: cookies,
    },
  });
  const data = await response.json();
  return data;
}

export async function fetchLikedData(
  lng: string,
  limit: string,
  cookies?: any,
) {
  const response = await fetch(
    API_URI + `/api/like?lng=${lng}&limit=${limit}`,
    {
      method: "GET",
      next: { revalidate: cacheTimeEnum.FIVE_MINUTES },
      headers: {
        cookie: cookies,
      },
    },
  );
  const data = await response.json();
  return data;
}
