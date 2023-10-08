"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { translate } from "@/app/i18n/client";

interface ISearchLimitProps {
  lng: string;
}

export default function SearchLimit({ lng }: ISearchLimitProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { t } = translate(lng, "search");

  const [limit, setLimit] = useState("20");

  // if changed limit, update the limit in the URL
  useEffect(() => {
    setLimit(searchParams.get("limit") || "");
  }, [searchParams.get("limit")]);

  // add a query string to the current URL
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  return (
    <div>
      <label htmlFor="limit">{t("page-limit")}</label>
      <select
        id="limit"
        onChange={(e) => {
          router.replace(
            pathname + "?" + createQueryString("limit", e.target.value),
          );
        }}
        value={limit}
      >
        <option value="20">20</option>
        <option value="40">40</option>
        <option value="60">60</option>
      </select>
    </div>
  );
}
