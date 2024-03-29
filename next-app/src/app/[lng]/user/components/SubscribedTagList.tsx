"use client";

import Link from "next/link";
import {
  useSubscribedTags,
  ITag,
} from "@/app/[lng]/user/components/useSubscribedTags";
import { useUnsubscribeTag } from "@/app/[lng]/user/components/useUnsubscribeTag";

type lngType = "ko" | "en" | "ja";

export default function SubscribedTagList({ lng }: { lng: string }) {
  const { tags } = useSubscribedTags();
  const unsubscribeTag = useUnsubscribeTag();
  return (
    <>
      <div className="flex space-x-1">
        <p>키워드 수: </p>
        <p>{tags?.length ?? 0}</p>
      </div>
      <div className="flex flex-wrap">
        {!tags?.message
          ? tags?.map((tag: ITag) => (
              <div
                key={tag.tagId}
                className="mb-2 mr-2 flex items-center space-x-2 rounded-md border bg-gray-100 px-2 py-1"
              >
                <Link href={`/${lng}/search?tag=${tag.tagId}`}>
                  <span className="text-base font-bold hover:text-gigas-700 hover:underline">
                    {tag[lng as lngType]}
                  </span>
                </Link>
                <button
                  className="text-base-semibold text-gray-500"
                  onClick={() => unsubscribeTag(tag.tagId)}
                >
                  ×
                </button>
              </div>
            ))
          : ""}
      </div>
    </>
  );
}
