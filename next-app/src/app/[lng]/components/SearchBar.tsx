"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

function SearchBar({ lng }: { lng: string }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  function submitHandler(e: FormEvent) {
    e.preventDefault();
    router.push(`/${lng}/search?name=${search}`);
  }

  return (
    <form onSubmit={submitHandler}>
      <label
        htmlFor="default-search"
        className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
      >
        Search
      </label>
      <div className="relative">
        <input
          type="search"
          id="name"
          className="block w-full p-2 pl-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Search"
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="reset"
          className="absolute right-12 bottom-2 text-heading4-medium text-gray-700 hover:text-gray-500"
        >
          ×
        </button>
        <button
          type="submit"
          className="absolute top-0 right-0 p-2.5 text-sm font-medium h-full text-white bg-gigas-700 rounded-r-lg border border-gigas-700 hover:bg-gigas-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          <svg
            className="w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
          <span className="sr-only">Search</span>
        </button>
      </div>
    </form>
  );
}

export default SearchBar;
