// components/SearchForm.tsx
// ReadonlyURLSearchParams is incompatible with URLSearchParams
// https://github.com/vercel/next.js/issues/49774

"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { translate } from "@/app/i18n/client";
import {
  propertyOrder,
  switchTagLng,
} from "@/app/[lng]/components/display-capsule-tag";
import { propertyTranslator } from "@/lib/text-translator";

interface ISearchFormProps {
  lng: string;
}

async function getTags(searchTag: string) {
  try {
    const res = await fetch(`/api/tags?v=${searchTag}`, { cache: "no-store" });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

export default function SearchForm({ lng }: ISearchFormProps) {
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [isHidden, setIsHidden] = useState(true);
  const [searchTag, setSearchTag] = useState("");
  const [selectedTag, setSelectedTag] = useState<any[]>([]);
  const [tagList, setTagList] = useState<any[]>([]);
  const [initTagList, setInitTagList] = useState<any[]>([]);

  const { t } = translate(lng, "search");

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleInsertTagClick = (tag: any) => {
    if (selectedTag.length >= 3) {
      return;
    }
    if (selectedTag.includes(tag)) {
      setSelectedTag(selectedTag.filter((item) => item !== tag));
    } else {
      setSelectedTag([...selectedTag, tag]);
    }
  };

  const handleRemoveTagClick = (tag: any) => {
    setSelectedTag(selectedTag.filter((item) => item !== tag));
  };

  const presentTagList = (tags: any, lng: string) => {
    tags.sort((a: any, b: any) => a.linkCount - b.linkCount);
    tags.sort((a: any, b: any) => propertyOrder(a) - propertyOrder(b));

    const filteredTags = tags.filter(
      (tag: any) =>
        tag.ja.some((jaTag: any) => jaTag.includes(searchTag)) ||
        tag.ko.some((koTag: any) => koTag.includes(searchTag)) ||
        tag.en.some((enTag: any) => enTag.includes(searchTag))
    );

    let tempProperty = "";

    return (
      <div className="absolute mt-1 bg-white border border-gray-300 rounded shadow w-[500px] max-h-[400px] pl-5 pr-5 pb-5 pt-2 overflow-y-scroll">
        <div
          className="absolute right-5 text-heading1-bold cursor-pointer text-gray-500 hover:text-gray-700"
          onClick={() => setIsHidden(true)}
        >
          ×
        </div>
        {filteredTags.length === 0 && (
          <p className="text-heading4-medium pb-3 pt-3">
            {t("no-result-found")}
          </p>
        )}
        {filteredTags.map((tag: any, index: number) => {
          if (tempProperty !== tag.property) {
            tempProperty = tag.property;
            return (
              <React.Fragment key={index}>
                <p className="text-heading4-medium pb-3 pt-3">
                  {propertyTranslator(tag.property, lng)}
                </p>
                <span
                  className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 cursor-pointer"
                  onClick={() => handleInsertTagClick(tag)}
                >
                  {switchTagLng(tag, lng)}
                </span>
              </React.Fragment>
            );
          } else {
            return (
              <span
                key={index}
                className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 cursor-pointer"
                onClick={() => handleInsertTagClick(tag)}
              >
                {switchTagLng(tag, lng)}
              </span>
            );
          }
        })}
      </div>
    );
  };

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

    if (selectedTag.length > 0) {
      queryParams.set("tag", selectedTag.map((tag) => tag._id).join(""));
    } else {
      queryParams.delete("tag");
    }

    router.push(`/${lng}/search?${queryParams.toString()}`);
    setIsHidden(true);
  };

  const handleReset = () => {
    setBrand("");
    setName("");
    setYear("");
    setMonth("");
    setSelectedTag([]);
    setIsHidden(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/tags", { cache: "no-store" });
        const data = await response.json();
        // API 결과를 상태에 저장
        setInitTagList(data);
        setTagList(data);
      } catch (error) {
        console.error("API 호출 중 오류 발생:", error);
      }
    };

    // 컴포넌트 마운트 시 API 호출
    fetchData();
  }, []);

  // useEffect(() => {
  //   console.log(initTagList);
  //   console.log(tagList);
  // }, [initTagList, tagList]);

  // set the state based on the query string
  useEffect(() => {
    const date = searchParams.get("startDate") || "";
    const [year, month] = date.split("-");

    setBrand(searchParams.get("brand") || "");
    setName(searchParams.get("name") || "");
    setYear(year || "");
    setMonth(month || "");

    const fetchTags = async () => {
      try {
        const response = await fetch(
          "/api/tags?id=" + searchParams.get("tag"),
          {
            cache: "no-store",
          }
        );
        const data = await response.json();
        setSelectedTag(data);
      } catch (error) {
        console.error("API 호출 중 오류 발생:", error);
      }
    };
    searchParams.get("tag") ? fetchTags() : null;
  }, [searchParams]);

  useEffect(() => {
    if (searchTag.length > 0) {
      getTags(searchTag).then((data) => setTagList(data));
    } else if (initTagList.length > 0) {
      setTagList(initTagList);
    }
  }, [searchTag]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-between">
        <div className="flex space-x-10">
          <div className="flex space-x-5 self-center relative">
            <label htmlFor="name" className="text-heading4-medium">
              {t("keyword")}
            </label>
            <input
              className="border border-gray-500 "
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setIsHidden(true)}
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
                  onFocus={() => setIsHidden(true)}
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
                  onFocus={() => setIsHidden(true)}
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
              onFocus={() => setIsHidden(true)}
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
      <div className="flex space-x-5 self-center pt-3">
        <label htmlFor="name" className="text-heading4-medium">
          {t("tag")}
        </label>
        <div className="relative">
          <input
            className="border border-gray-500 clearable"
            type="text"
            id="tag"
            value={searchTag}
            onChange={(e) => setSearchTag(e.target.value)}
            onFocus={() => setIsHidden(false)}
          />
          {!isHidden ? (
            <div className="absolute top-8 left-0">
              {presentTagList(tagList, lng)}
            </div>
          ) : null}
        </div>
        <div className="flex">
          {selectedTag.length > 0
            ? selectedTag.map((tag: any, index) => (
                <span
                  key={index}
                  className="flex bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 cursor-pointer"
                  onClick={() => handleRemoveTagClick(tag)}
                >
                  {switchTagLng(tag, lng)}
                </span>
              ))
            : null}
        </div>
      </div>
    </form>
  );
}
