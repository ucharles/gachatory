"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { translate } from "@/app/i18n/client";
import { sortEnum } from "@/lib/enums";

function SortCapsuleList({
  lng,
  searchParams,
}: {
  lng: string;
  searchParams: any;
}) {
  const params = new URLSearchParams(searchParams);
  const router = useRouter();
  const { t } = translate(lng, "translation");

  const paramSort = params.get("sort") || sortEnum.DESC;

  const [sort, setSort] = useState(paramSort);

  useEffect(() => {
    setSort(paramSort);
  }, [params.get("sort")]);

  function handleButtonClick() {
    if (sort === sortEnum.DESC) {
      setSort(sortEnum.ASC);
      params.set("sort", sortEnum.ASC);
      router.replace(`/${lng}?${params.toString()}`);
    } else {
      setSort(sortEnum.DESC);
      params.set("sort", sortEnum.DESC);
      router.replace(`/${lng}?${params.toString()}`);
    }
  }

  return (
    <div>
      <button
        className="flex items-center space-x-2"
        onClick={handleButtonClick}
      >
        <div className="">{t("sort-by")}</div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="6"
          viewBox="0 0 10 6"
        >
          <path
            id="다각형_1"
            data-name="다각형 1"
            d="M5,0l5,6H0Z"
            transform={`${
              sort === sortEnum.DESC ? "translate(10 6) rotate(180)" : ""
            }`}
            fill="#949494"
          />
        </svg>
      </button>
    </div>
  );
}

export default SortCapsuleList;
