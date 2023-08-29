// components/SearchForm.tsx
// ReadonlyURLSearchParams is incompatible with URLSearchParams
// https://github.com/vercel/next.js/issues/49774

"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/app/i18n/client";

interface ISearchFormProps {
  lng: string;
}

export default function SearchForm({ lng }: ISearchFormProps) {
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");

  const { t } = useTranslation(lng, "search");

  const router = useRouter();
  const searchParams = useSearchParams();

  // set the state based on the query string
  useEffect(() => {
    const date = searchParams.get("startDate") || "";
    const [year, month] = date.split("-");

    setBrand(searchParams.get("brand") || "");
    setName(searchParams.get("name") || "");
    setYear(year || "");
    setMonth(month || "");
  }, [searchParams]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Construct the query string based on entered values
    const queryParams = new URLSearchParams(Array.from(searchParams.entries()));
    queryParams.set("page", "1");

    // if not empty string, add to query string
    // else, delete from query string
    brand ? queryParams.set("brand", brand) : queryParams.delete("brand");
    name ? queryParams.set("name", name) : queryParams.delete("name");
    year && month
      ? queryParams.set("startDate", year + "-" + month)
      : queryParams.delete("startDate");

    router.push(`/${lng}/search?${queryParams.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">{t("keyword")}: </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="startDate">{t("release-date")}: </label>
        <input
          type="text"
          id="year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        {t("year")}
        <input
          type="text"
          id="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
        {t("month")}
      </div>
      <div>
        <label htmlFor="brand">{t("brand")}: </label>
        <input
          type="text"
          id="brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
      </div>
      <div>
        <button type="submit">{t("submit")}</button>
      </div>
    </form>
  );
}
