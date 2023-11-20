"use client";
import { useQueryClient } from "@tanstack/react-query";
import { translate } from "@/app/i18n/client";

// likes - capsuleId - localization - title
// api fetch 결과를

export default function LikeSearchBar({ lng }: { lng: string }) {
  const { t } = translate(lng, "like");
  return (
    <div className="w-80 fold:w-full 3xs:w-full 2xs:w-full">
      <div className="w-auto rounded-3xl bg-bg-footer px-6 py-3 text-small-medium">
        {t("search-in-like-list")}
      </div>
    </div>
  );
}
