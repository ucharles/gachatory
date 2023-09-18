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
            className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
          >
            {switchTagLng(tag, lng)}
          </span>
        </Link>
      ))}
    </React.Fragment>
  );
}

export default DisplayCapsuleTags;
