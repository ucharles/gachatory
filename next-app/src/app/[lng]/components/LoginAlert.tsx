"use client";

import { translate } from "@/app/i18n/client";

export default function LoginAlert({
  lng,
  isDisplay,
}: {
  lng: string;
  isDisplay: boolean;
}) {
  const { t } = translate(lng, "translation");

  return (
    <div
      className={`fixed bottom-5 left-1/2 z-50 w-max -translate-x-1/2 ${
        isDisplay
          ? "translate-y-0 transition-transform duration-500"
          : "translate-y-[180%] transition-transform duration-500"
      }`}
    >
      <div
        className="mb-4 flex items-center rounded-lg border border-red-300 bg-red-50 p-4 text-base text-red-800 dark:border-red-800 dark:bg-gray-800 dark:text-red-400"
        role="alert"
      >
        <svg
          className="mr-3 inline h-4 w-4 flex-shrink-0"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
        </svg>
        <span className="sr-only">Info</span>
        <div>
          <span className="font-medium">{t("login-required")}</span>
        </div>
      </div>
    </div>
  );
}
