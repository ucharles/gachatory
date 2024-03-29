"use client";

import { useState } from "react";
import { useTags } from "@/components/tags/hooks/useTags";
import useDebounce from "../hooks/useDebounce";
import { Input } from "@/components/ui/input";

import { useSubscribeTag } from "../hooks/useSubscribeTag";

import Link from "next/link";

export default function SearchTags({ lng }: { lng: string }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const subscribeTag = useSubscribeTag();

  const { data: tags, isFetching } = useTags(debouncedSearch);

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
  }

  return (
    <>
      <div>
        <Input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search tags..."
        />
        <div className="p-2"></div>
        <div className="min-height:h-44 w-full">
          {isFetching && <div>Loading...</div>}
          <ul className="flex flex-wrap">
            {tags?.map((tag: any) => (
              <li
                key={tag._id}
                className="mb-2 mr-2 flex space-x-2 rounded-md border bg-gray-100 px-2 py-1"
              >
                <Link href={`/${lng}/search?tag=${tag._id}`}>
                  <p className="font-bold hover:text-gigas-700 hover:underline">
                    {tag[lng][0]}
                  </p>
                </Link>
                <button
                  className="rounded-full border bg-slate-300 px-2 font-bold transition duration-200 ease-in-out hover:bg-slate-500 hover:text-white"
                  onClick={() => subscribeTag(tag._id)}
                  title={`Subscribe to ${tag[lng][0]}`}
                >
                  +
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
