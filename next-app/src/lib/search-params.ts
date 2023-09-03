import { dateConveter } from "@/lib/date-converter";
import { perPageEnum } from "@/lib/per-page-enum";

export function searchParams(url: string) {
  const params = new URLSearchParams(new URL(url).search);

  const query: any = {};

  const sort = params.get("sort");

  const lng = params.get("lng");

  const brand = params.get("brand");
  brand ? (query.brand = new RegExp(brand as string, "i")) : null;

  const name = params.get("name");
  name
    ? (query.$or = [
        { name: new RegExp(name as string, "i") },
        { description: new RegExp(name as string, "i") },
      ])
    : null;

  const price = params.get("price");
  price ? (query.price = +price) : null;

  const startDate = params.get("startDate");
  startDate
    ? (query.date = new RegExp(dateConveter(startDate) as string, "i"))
    : null;

  let currentPage = 1;
  const page = params.get("page");
  page ? (currentPage = +page) : null;

  let perPage = perPageEnum.SMALL;
  const limit = params.get("limit");
  if (limit) {
    perPage = +limit || perPageEnum.SMALL;
    if (perPage <= perPageEnum.SMALL) perPage = perPageEnum.SMALL;
    else if (perPage > perPageEnum.SMALL && perPage <= perPageEnum.MEDIUM)
      perPage = perPageEnum.MEDIUM;
    else if (perPage > perPageEnum.MEDIUM) perPage = perPageEnum.LARGE;
    else perPage = perPageEnum.LARGE;
  }

  return { lng, query, sort, currentPage, perPage };
}
