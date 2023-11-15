// components/Pagination.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { perPageEnum } from "@/lib/enums";
import { set } from "mongoose";

interface PaginationProps {
  total: number; // total number of items
  maxPages?: number; // max number of pages to show
}

export default function Pagination({ total, maxPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  let tempPage = searchParams.get("page");
  if (
    tempPage === undefined ||
    tempPage === "" ||
    parseInt(tempPage || "0") < 1
  ) {
    tempPage = "1";
  }

  let tempLimit = searchParams.get("limit");
  if (
    tempLimit === undefined ||
    tempLimit === "" ||
    parseInt(tempLimit || "0") < perPageEnum.SMALL
  ) {
    tempLimit = "20";
  }

  const currentPage = Number(tempPage);
  const itemsPerPage = Number(tempLimit);
  const totalItems = total === 0 ? 1 : total;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const maxPagesToShow = maxPages || 5;

  const [startPage, setStartPage] = useState(currentPage);

  // add a query string to the current URL
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  // function to calculate the start index of the items to show
  // start index is divided by 10, rounded down, then multiplied by 10
  const calculateStartIndex = useCallback(() => {
    return Math.floor((currentPage - 1) / maxPagesToShow) * maxPagesToShow + 1;
  }, [currentPage]);

  // if change in search params, reset start page to 1
  useEffect(() => {
    setStartPage(calculateStartIndex);
  }, [
    searchParams.get("brand"),
    searchParams.get("name"),
    searchParams.get("startDate"),
    searchParams.get("description"),
    searchParams.get("page"),
  ]);

  // useEffect(() => {
  //   if (searchParams.get("page") === null) {
  //     setStartPage(currentPage);
  //   } else {
  //     setStartPage(calculateStartIndex);
  //   }
  // }, [searchParams.get("page")]);

  // if changed limit and if current page is out of range, reset to max page
  useEffect(() => {
    if (currentPage > totalPages) {
      router.push(
        pathname + "?" + createQueryString("page", totalPages.toString()),
      );
      setStartPage(totalPages - maxPagesToShow + 1);
    } else {
      setStartPage(calculateStartIndex);
    }
  }, [searchParams.get("limit")]);

  const goForward = () => {
    if (currentPage === totalPages) {
      return;
    }
    router.push(
      pathname +
        "?" +
        createQueryString(
          "page",
          (calculateStartIndex() + maxPagesToShow).toString(),
        ),
    );
    setStartPage((prevStart) => prevStart + maxPagesToShow);
  };

  const goBackward = () => {
    if (calculateStartIndex() === 1) {
      router.push(pathname + "?" + createQueryString("page", "1"));
      setStartPage(1);
    } else {
      router.push(
        pathname +
          "?" +
          createQueryString("page", (calculateStartIndex() - 1).toString()),
      );
      setStartPage((prevStart) => prevStart - maxPagesToShow);
    }
  };

  const goNext = () => {
    if (currentPage === totalPages) {
      return;
    } else {
      router.push(
        pathname +
          "?" +
          createQueryString("page", (currentPage + 1).toString()),
      );
    }
  };

  const goPrev = () => {
    if (currentPage === 1) {
      return;
    } else {
      router.push(
        pathname +
          "?" +
          createQueryString("page", (currentPage - 1).toString()),
      );
    }
  };

  const highlightedStyle = {
    color: "#6757d4",
    fontWeight: "bold",
    textDecoration: "underline",
  };

  return (
    <div>
      <div className="flex items-center justify-center space-x-1">
        {currentPage > maxPagesToShow ? (
          <>
            <button
              className={`flex h-6 items-center justify-center ${
                currentPage > 100 ? "w-8" : "w-6"
              }`}
              onClick={goBackward}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14.467"
                height="14"
                viewBox="0 0 14.467 14"
              >
                <path
                  id="last_page_FILL0_wght400_GRAD0_opsz24"
                  d="M225.633-706,224-707.634,229.367-713,224-718.367,225.633-720l7,7Zm10.5,0v-14h2.333v14Z"
                  transform="translate(238.467 -706) rotate(180)"
                  fill="#707070"
                />
              </svg>
            </button>
            <button
              className={`flex h-6 items-center justify-center ${
                currentPage > 100 ? "w-8" : "w-6"
              }`}
              onClick={goPrev}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="8.633"
                height="14"
                viewBox="0 0 8.633 14"
              >
                <path
                  id="last_page_FILL0_wght400_GRAD0_opsz24"
                  d="M225.633-706,224-707.634,229.367-713,224-718.367,225.633-720l7,7Z"
                  transform="translate(232.633 -706) rotate(180)"
                  fill="#707070"
                />
              </svg>
            </button>
          </>
        ) : null}
        {Array.from(
          { length: Math.min(maxPagesToShow, totalPages - startPage + 1) },
          (_, i) => i + startPage,
        ).map((page) => (
          <button
            className={`flex h-6 items-center justify-center ${
              currentPage > 100 ? "w-8" : "w-6"
            }`}
            key={page}
            style={page === currentPage ? highlightedStyle : {}}
            onClick={(e) => {
              router.push(
                pathname + "?" + createQueryString("page", page.toString()),
              );
            }}
            disabled={page === currentPage}
          >
            {page}
          </button>
        ))}
        {currentPage < totalPages ? (
          <>
            <button
              className={`flex h-6 items-center justify-center ${
                currentPage > 100 ? "w-8" : "w-6"
              }`}
              onClick={goNext}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="8.633"
                height="14"
                viewBox="0 0 8.633 14"
              >
                <path
                  id="last_page_FILL0_wght400_GRAD0_opsz24"
                  d="M225.633-706,224-707.634,229.367-713,224-718.367,225.633-720l7,7Z"
                  transform="translate(-224 720)"
                  fill="#707070"
                />
              </svg>
            </button>
            <button
              className={`flex h-6 items-center justify-center ${
                currentPage > 100 ? "w-8" : "w-6"
              }`}
              onClick={goForward}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14.467"
                height="14"
                viewBox="0 0 14.467 14"
              >
                <path
                  id="last_page_FILL0_wght400_GRAD0_opsz24"
                  d="M225.633-706,224-707.634,229.367-713,224-718.367,225.633-720l7,7Zm10.5,0v-14h2.333v14Z"
                  transform="translate(-224 720)"
                  fill="#707070"
                />
              </svg>
            </button>
          </>
        ) : null}
      </div>
      <div></div>
    </div>
  );
}
