"use client";
import { translate } from "@/app/i18n/client";

// likes - capsuleId - localization - title
// api fetch 결과를

export default function LikeSearchBar({ lng }: { lng: string }) {
  const { t } = translate(lng, "like");
  return (
    <div className="w-full xs:w-80">
      <div className="w-auto rounded-3xl bg-bg-footer px-6 py-3 text-small-medium">
        {t("search-in-like-list")}
      </div>
    </div>
  );
}
