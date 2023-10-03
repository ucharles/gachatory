"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getCurrentMonthYYYYMM,
  addMonthsToYYYYMM,
  addDotToYYYYMM,
} from "@/lib/search-date-string";

function generateDateList() {
  const dateList = [];
  const currentMonth = getCurrentMonthYYYYMM();

  for (let i = 0; i < 6; i++) {
    dateList.push(addMonthsToYYYYMM(currentMonth, -i));
  }

  return dateList;
}

function ReleaseDateList({
  lng,
  searchParams,
}: {
  lng: string;
  searchParams: any;
}) {
  const params = new URLSearchParams(searchParams);
  const router = useRouter();

  const paramDate = params.get("date") || getCurrentMonthYYYYMM();

  const [selectedDate, setSelectedDate] = useState(paramDate);
  const [isDateListOpen, setIsDateListOpen] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (
        listRef.current &&
        !(listRef.current as HTMLElement).contains(event.target as Node)
      ) {
        setIsDateListOpen(false);
      }
    }

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    setSelectedDate(paramDate);
  }, [params.get("date")]);

  function handleButtonClick() {
    setIsDateListOpen(!isDateListOpen);
  }

  function handleDateClick(e: React.MouseEvent<HTMLLIElement>) {
    e.preventDefault();
    setSelectedDate(e.currentTarget.id);
    setIsDateListOpen(false);
    params.set("date", e.currentTarget.id);
    router.replace(`/${lng}?${params.toString()}`);
  }

  return (
    <div>
      <div className="w-fit">
        <button
          className="flex items-center justify-center space-x-3"
          onClick={handleButtonClick}
          ref={listRef}
        >
          <h1 className="font-YgJalnan text-4xl text-gigas-700 fold:text-3xl 3xs:text-2xl 2xs:text-3xl">
            {addDotToYYYYMM(selectedDate)}
          </h1>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="6"
            viewBox="0 0 10 6"
          >
            <path
              id="다각형_2"
              data-name="다각형 2"
              d="M5,0l5,6H0Z"
              transform={`${
                isDateListOpen ? "" : "translate(10 6) rotate(180)"
              }`}
              fill="#5141ae"
            />
          </svg>
        </button>
        <div className={`${isDateListOpen ? null : "hidden"} relative`}>
          <ul className="absolute z-50 w-full divide-y rounded-b-lg border bg-background-white">
            {generateDateList().map((date) => (
              <li
                key={date}
                id={date!}
                onClick={handleDateClick}
                className="py-2 hover:bg-gigas-100"
              >
                <p
                  className={`text-center font-YgJalnan ${
                    selectedDate === date ? "text-gigas-700" : "text-gray-600"
                  } text-heading4-bold `}
                >
                  {addDotToYYYYMM(date!)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ReleaseDateList;
