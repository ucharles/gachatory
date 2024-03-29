"use client";

import { convertToLocalTime } from "@/lib/date-converter";

export default function DisplayDate({
  date,
  className,
}: {
  date: string;
  className?: string;
}) {
  // 브라우저 정보에 따라 다른 언어로 날짜를 표시합니다.

  return <p className={className}>{convertToLocalTime(date)}</p>;
}
