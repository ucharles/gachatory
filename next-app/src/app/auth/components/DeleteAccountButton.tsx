"use client";

import { signOut } from "next-auth/react";
import { translate } from "@/app/i18n/client";

export default function DeleteAccountButton({
  lng,
  id,
}: {
  lng: string;
  id?: string;
}) {
  const { t } = translate(lng, "account");

  return (
    <button
      className="text-red-500"
      onClick={() => {
        if (confirm(t("delete-account-message"))) {
          fetch(`/api/auth/${id ?? ""}`, {
            method: "DELETE",
          }).then(() => {
            signOut();
          });
        }
      }}
    >
      {t("delete-account")}
    </button>
  );
}
