"use client";

import React from "react";
import Link from "next/link";
import { ICapsuleTag } from "@/lib/models/capsule-tag-model";
import { capsuleTagPropertyEnum } from "@/lib/enums";

export const switchTagLng = (tag: ICapsuleTag, lng: string) => {
  switch (lng) {
    case "ja":
      return tag["ja"][0];
    case "ko":
      return tag["ko"][0];
    case "en":
      return tag["en"][0];
    default:
      return null;
  }
};

// property의 우선순위에 따라 태그 순서 재정렬
const propertyMap: { [key: string]: number } = {
  title: capsuleTagPropertyEnum.TITLE,
  character: capsuleTagPropertyEnum.CHARACTER,
  series: capsuleTagPropertyEnum.SERIES,
  author: capsuleTagPropertyEnum.AUTHOR,
  category: capsuleTagPropertyEnum.CATEGORY,
  element: capsuleTagPropertyEnum.ELEMENT,
  brand: capsuleTagPropertyEnum.BRAND,
};

export const propertyOrder = (tag: ICapsuleTag): number => {
  return propertyMap[tag.property] || Number.MAX_SAFE_INTEGER;
};

function DisplayCapsuleTags({
  tags,
  lng,
}: {
  tags: Array<ICapsuleTag>;
  lng: string;
}) {
  // 태그를 property 우선순위에 따라 정렬
  tags.sort((a, b) => propertyOrder(a) - propertyOrder(b));

  return (
    <React.Fragment>
      {tags.map((tag, index) => (
        <Link href={`/${lng}/search?tag=${tag._id}`} key={index}>
          <span
            key={index}
            className="mb-2 mr-2 inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700"
          >
            {switchTagLng(tag, lng)}
          </span>
        </Link>
      ))}
    </React.Fragment>
  );
}

export function DisplayCapsuleOneTag({
  tags,
  lng,
}: {
  tags: Array<ICapsuleTag>;
  lng: string;
}) {
  tags.sort((a, b) => propertyOrder(a) - propertyOrder(b));

  return (
    <>
      {tags.length > 0 ? (
        <Link href={`/${lng}/search?tag=${tags[0]._id}`}>
          <div
            className="rounded-2xl border border-gigas-700 px-2 py-1 text-small-semibold text-gigas-700 transition duration-200 hover:bg-gigas-700 hover:text-background-white"
            key={tags[0]._id}
          >
            <p className="truncate">{switchTagLng(tags[0], lng)}</p>
          </div>
        </Link>
      ) : null}
    </>
  );
}

export default DisplayCapsuleTags;
