"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

import SignOutButton from "@/app/auth/components/SignOutButton";

import { translate } from "@/app/i18n/client";

import { useQuery } from "@tanstack/react-query";
import { getNotificationCount } from "@/lib/fetch-data";

export default function UserInfoOverlay({
  lng,
  children,
}: {
  lng: string;
  children: React.ReactNode;
}) {
  const { t } = translate(lng, "translation");

  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const overlayRef = useRef(null);

  const { data: notificationCount } = useQuery({
    queryKey: ["notificationCount"],
    queryFn: () => getNotificationCount(),
  });

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (
        overlayRef.current &&
        !(overlayRef.current as HTMLElement).contains(event.target as Node)
      ) {
        setIsOverlayOpen(false);
      }
    }

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  return (
    <div>
      <div className="avatar-notification-indicator relative">
        <button
          className="flex items-center"
          onClick={() => setIsOverlayOpen(!isOverlayOpen)}
          ref={overlayRef}
        >
          {children}
        </button>
        <div
          className={`${
            notificationCount.length > 0 ? "block" : "hidden"
          } absolute -right-2 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white`}
        >
          {notificationCount?.length <= 9 ? notificationCount?.length : "9+"}
        </div>
      </div>
      <div
        className={`${
          isOverlayOpen ? "block" : "hidden"
        } absolute right-4 mt-4 md:right-0`}
      >
        <div className="space-y-3 rounded-lg bg-bg-footer p-5 text-sm">
          <p>
            <Link href={`/${lng}/user/dashboard`}>{t("mypage")}</Link>
          </p>
          <p>
            <Link href={`/${lng}/user/account`}>{t("account-info")}</Link>
          </p>
          <div className="flex items-center space-x-2">
            <Link href={`/${lng}/user/notifications`}>
              {t("keyword-notification")}
            </Link>
            <div
              className={`${
                notificationCount.length > 0 ? "block" : "hidden"
              } flex h-2 w-2 rounded-full bg-red-500`}
            ></div>
          </div>
          <SignOutButton lng={lng} />
        </div>
      </div>
    </div>
  );
}
