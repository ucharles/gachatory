"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { translate } from "@/app/i18n/client";
import { sortEnum } from "@/lib/enums";

function SortCapsuleList({
  lng,
  searchParams,
  paramName,
}: {
  lng: string;
  searchParams: any;
  paramName: string;
}) {
  const params = new URLSearchParams(searchParams);
  const router = useRouter();
  const { t } = translate(lng, "translation");

  const paramSort = params.get(paramName) || sortEnum.DESC;

  const pathname = usePathname();

  const [sort, setSort] = useState(paramSort);

  useEffect(() => {
    setSort(paramSort);
  }, [params.get(paramName)]);

  function handleButtonClick() {
    if (sort === sortEnum.DESC) {
      setSort(sortEnum.ASC);
      params.set(paramName, sortEnum.ASC);
      router.replace(`?${params.toString()}`);
    } else {
      setSort(sortEnum.DESC);
      params.set(paramName, sortEnum.DESC);
      router.replace(`?${params.toString()}`);
    }
  }

  return (
    <div>
      <button
        className="flex items-center space-x-2"
        onClick={handleButtonClick}
      >
        <div className="">{t(paramName)}</div>
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
