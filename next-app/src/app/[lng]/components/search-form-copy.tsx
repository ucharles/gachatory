// components/SearchForm.tsx
// ReadonlyURLSearchParams is incompatible with URLSearchParams
// https://github.com/vercel/next.js/issues/49774

"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { translate } from "@/app/i18n/client";

interface ISearchFormProps {
  lng: string;
}

export default function SearchForm({ lng }: ISearchFormProps) {
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");

  const { t } = translate(lng, "search");

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
      ? queryParams.set("startDate", year + "-" + month.padStart(2, "0"))
      : queryParams.delete("startDate");

    router.push(`/${lng}/search?${queryParams.toString()}`);
  };

  const handleReset = () => {
    setBrand("");
    setName("");
    setYear("");
    setMonth("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-between">
        <div className="flex space-x-10">
          <div className="flex space-x-5 self-center">
            <label htmlFor="name" className="text-heading4-medium">
              {t("keyword")}
            </label>
            <input
              className="border border-gray-500"
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex space-x-5 self-center">
            <label htmlFor="startDate" className="text-heading4-medium">
              {t("release-date")}
            </label>
            <div className="flex space-x-3 self-center">
              <div className="flex space-x-1 self-center">
                <input
                  className="border border-gray-500 w-12"
                  type="text"
                  id="year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
                <p>{t("year")}</p>
              </div>
              <div className="flex space-x-1 self-center">
                <input
                  className="border border-gray-500 w-10"
                  type="text"
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
                <p>{t("month")}</p>
              </div>
            </div>
          </div>
          <div className="flex space-x-5 self-center">
            <label htmlFor="brand" className="text-heading4-medium">
              {t("brand")}
            </label>
            <input
              className="border border-gray-500"
              type="text"
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <div className="space-x-3">
            <button
              className="bg-gradient-to-r from-purple-500 to-yellow-500 hover:from-purple-600 hover:to-yellow-600 focus:outline-none focus:ring focus:ring-purple-300 active:bg-yellow-700 px-6 py-3 rounded-lg text-white font-semibold shadow-md transition duration-300 ease-in-out transform hover:scale-105"
              type="submit"
            >
              {t("submit")}
            </button>
            <button
              className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 focus:outline-none focus:ring focus:ring-green-300 active:bg-orange-700 px-6 py-3 rounded-lg text-white font-semibold shadow-md transition duration-300 ease-in-out transform hover:scale-105"
              type="reset"
              onClick={handleReset}
            >
              {t("reset")}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
