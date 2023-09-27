// components/Pagination.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { perPageEnum } from "@/lib/enums";

interface PaginationProps {
  total: number; // total number of items
}

export default function Pagination({ total }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const itemsPerPage = Number(searchParams.get("limit")) || perPageEnum.SMALL;
  const totalPages = Math.ceil(total === 0 ? 1 : total / itemsPerPage);

  const maxPagesToShow = 7;

  const [startPage, setStartPage] = useState(currentPage);

  // add a query string to the current URL
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
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
      setStartPage(totalPages - maxPagesToShow + 1);
      router.push(
        pathname + "?" + createQueryString("page", totalPages.toString())
      );
    } else {
      setStartPage(calculateStartIndex);
    }
  }, [searchParams.get("limit")]);

  const goForward = () => {
    setStartPage((prevStart) => prevStart + maxPagesToShow);
    router.push(
      pathname +
        "?" +
        createQueryString("page", (calculateStartIndex() + 10).toString())
    );
  };

  const goBackward = () => {
    setStartPage((prevStart) => prevStart - maxPagesToShow);
    router.push(
      pathname +
        "?" +
        createQueryString("page", (calculateStartIndex() - 1).toString())
    );
  };

  const highlightedStyle = {
    backgroundColor: "#6757d4", // Choose highlight color
    color: "white",
  };

  return (
    <div className="space-x-1 pt-5 pb-5">
      {startPage > 1 && (
        <button
          className="h-8 w-8 border border-gray-400 shadow rounded-md"
          onClick={goBackward}
        >
          &laquo;
        </button>
      )}
      {Array.from(
        { length: Math.min(maxPagesToShow, totalPages - startPage + 1) },
        (_, i) => i + startPage
      ).map((page) => (
        <button
          className="h-8 w-8 border border-gray-400 shadow rounded-md"
          key={page}
          style={page === currentPage ? highlightedStyle : {}}
          onClick={(e) => {
            router.push(
              pathname + "?" + createQueryString("page", page.toString())
            );
          }}
          disabled={page === currentPage}
        >
          {page}
        </button>
      ))}
      {startPage + maxPagesToShow - 1 < totalPages && (
        <button
          className="h-8 w-8 border border-gray-400 shadow rounded-md"
          onClick={goForward}
        >
          &raquo;
        </button>
      )}
    </div>
  );
}
