import { dateConveter } from "@/lib/date-converter";
import { perPageEnum } from "@/lib/enums";
import mongoose from "mongoose";

export function searchParams(url: string) {
  const params = new URLSearchParams(new URL(url).search);

  const query: any = {};

  query.$and = [{}];

  query.$and.push({
    name: new RegExp("^((?!箱売).)*$", "i"),
  });

  const sort = params.get("sort");

  const sortField = params.get("sortField");

  const lng = params.get("lng");

  const brand = params.get("brand");
  brand ? (query.brand = new RegExp(brand as string, "i")) : null;

  const name = params.get("name");
  let locSearchName = "";

  if (name) {
    const escapedName = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    locSearchName = escapedName;
    query.$and.push({
      $or: [
        { name: new RegExp(escapedName as string, "i") },
        { description: new RegExp(escapedName as string, "i") },
      ],
    });
  }

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
  const blkimg = params.get("blankimg");
  blkimg
    ? query.$and.push({
        $and: [{ img: { $ne: "" } }, { detail_img: { $ne: [] } }],
      })
    : null;

  const chunkSize = 24;
  const regex = new RegExp(`.{1,${chunkSize}}`, "g");

  const tagIds = params.get("tag")?.match(regex);
  const filteredTagIds = tagIds?.filter((tagId) => tagId.length === 24);
  const objectIdTagIds = filteredTagIds?.map(
    (tagId) => new mongoose.Types.ObjectId(tagId)
  );

  if (objectIdTagIds && objectIdTagIds.length > 0) {
    // 모든 tagId가 ObjectId로 변환되도록 수정
    query.$and.push({ tagId: { $all: objectIdTagIds } });
  }

  const showDetailImgParam = params.get("showDetailImg");
  const showDetailImg = showDetailImgParam ? true : false;

  console.log(query);

  return {
    lng,
    query,
    sort,
    sortField,
    currentPage,
    perPage,
    showDetailImg,
    locSearchName,
  };
}
