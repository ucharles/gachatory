"use client";

import Image from "next/image";

interface LikedCapsulesListItemProps {
  id: string;
  name: string;
  date: string[];
  img: string;
  lng: string;
  liked_date: string;
}

export default function LikedCapsulesListItem({
  id,
  name,
  date,
  img,
  lng,
  liked_date,
}: LikedCapsulesListItemProps) {
  function XButtonHandler() {
    // TODO: 좋아요 취소
  }
  return (
    <li>
      <div className="flex h-24 justify-between space-x-6">
        <div className="basis-1/3 rounded-lg bg-bg-footer">
          <Image
            src={"/images/capsule.png"}
            alt={"test"}
            width={100}
            height={100}
          />
        </div>
        <div className="flex basis-2/3 justify-between space-x-6">
          <div>
            <p className="max-lines-2 break-words text-base-semibold">{name}</p>
            <div className="space-x-4">
              <span className="text-small-semibold">발매일</span>
              <span className="text-small-regular">{date}</span>
            </div>
            <div className="space-x-4">
              <span className="text-small-semibold">좋아요</span>
              <span className="text-small-regular">{liked_date}</span>
            </div>
          </div>
          <button className="text-xl" onClick={XButtonHandler}>
            ×
          </button>
        </div>
      </div>
    </li>
  );
}
