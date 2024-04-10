// 오름차순, 내림차순 정렬 버튼
// paramName은 sortBy, sortOrder
// 기본값은 sortBy: desc, sortOrder: like
// sortBy: desc, asc 둘 중 하나만 가능
// sortOrder: like, release 둘 중 하나만 가능

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { translate } from "@/app/i18n/client";

export default function LikeSort({
  lng,
  paramName,
  searchParams,
  defaultValue,
}: {
  lng: string;
  paramName: "sortBy" | "sortOrder";
  searchParams: any;
  defaultValue?: "desc" | "asc" | "like" | "release";
}) {
  const params = new URLSearchParams(searchParams);
  const { t } = translate(lng, "translation");
  const router = useRouter();

  const [value, setValue] = useState(params.get(paramName) || defaultValue);

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    params.set(paramName, value);
    router.replace(`?${params.toString()}`);
  }

  return (
    <div className="text-gray-800">
      {paramName === "sortOrder" && (
        <select defaultValue={value} onChange={handleSelect}>
          <option value="desc">{t("desc")}</option>
          <option value="asc">{t("asc")}</option>
        </select>
      )}
      {paramName === "sortBy" && (
        <select defaultValue={value} onChange={handleSelect}>
          <option value="like">{t("like-order")}</option>
          <option value="release">{t("recent-order")}</option>
        </select>
      )}
    </div>
  );
}
