"use client";

import React, { useState, useEffect } from "react";

function MoveOnTopAndDisplayDate({
  date,
  displayDate,
}: {
  date?: string;
  displayDate?: boolean;
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // 클릭시 스크롤바를 맨 위로 이동
  function handleClick() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        // 스크롤이 내려감
        setIsVisible(false);
      } else {
        // 스크롤이 올라감
        setIsVisible(true);
      }

      // 현재 스크롤 위치를 이전 스크롤 위치로 저장
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    // 컴포넌트 unmount 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <div
      className={`fixed bottom-16 right-0 z-50 rounded-l-lg border bg-background-white xs:bottom-32 ${
        isVisible ? "opacity-85" : "opacity-0"
      } transition-opacity duration-300`}
    >
      <div className="divide-y">
        <div className="group">
          <button
            className={`flex items-center justify-center  px-3 py-3 transition duration-200 group-hover:bg-gigas-700 ${
              displayDate ? "rounded-tl-lg" : "rounded-l-lg"
            }`}
            onClick={handleClick}
          >
            <svg
              id="arrow_upward_black_24dp"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="transition duration-200 group-hover:fill-background-white"
            >
              <path
                id="패스_22"
                data-name="패스 22"
                d="M0,0H24V24H0Z"
                fill="none"
              />
              <path
                id="패스_23"
                data-name="패스 23"
                d="M4,12l1.41,1.41L11,7.83V20h2V7.83l5.58,5.59L20,12,12,4Z"
              />
            </svg>
          </button>
        </div>
        {date ? (
          <div className="py-1 text-center text-gray-900">
            <p className="text-tiny-bold">{date.slice(0, 4)}</p>
            <p className="text-heading4-bold">{date.slice(-2)}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default MoveOnTopAndDisplayDate;
//
