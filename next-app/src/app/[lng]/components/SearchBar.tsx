"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { translate } from "@/app/i18n/client";

function SearchBar({ lng }: { lng: string }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { t } = translate(lng, "translation");

  function submitHandler(e: FormEvent) {
    e.preventDefault();
    router.push(`/${lng}/search?name=${search}`);
  }

  return (
    <form onSubmit={submitHandler}>
      <div className="relative">
        <input
          type="search"
          id="name"
          className="h-12 w-full rounded-[32px] bg-[#F0EFF3] p-2 pl-12 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gigas-500 focus:ring-offset-2 sm:text-lg xs:text-base"
          placeholder={t("search")}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="absolute left-4 top-3">
          <svg
            id="검색_아이콘"
            data-name="검색 아이콘"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              id="패스_19"
              data-name="패스 19"
              d="M0,0H24V24H0Z"
              fill="none"
            />
            <path
              id="패스_20"
              data-name="패스 20"
              d="M15.5,14h-.79l-.28-.27a6.51,6.51,0,1,0-.7.7l.27.28v.79l5,4.99L20.49,19Zm-6,0A4.5,4.5,0,1,1,14,9.5,4.494,4.494,0,0,1,9.5,14Z"
              fill="#707070"
            />
          </svg>
        </div>
      </div>
    </form>
  );
}

export default SearchBar;
