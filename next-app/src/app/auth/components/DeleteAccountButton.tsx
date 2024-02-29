"use client";

import { signOut } from "next-auth/react";
import { translate } from "@/app/i18n/client";
import { MySession } from "@/app/[lng]/user/account/page";

export default function DeleteAccountButton({
  lng,
  user,
}: {
  lng: string;
  user?: MySession["user"] | null;
}) {
  const { t } = translate(lng, "account");

  const { id } = user ?? {};

  return (
    <button
      className="text-red-500"
      onClick={() => {
        if (!confirm(t("delete-account-message"))) {
          return;
        }
        fetch(`/api/users/${id}`, {
          method: "DELETE",
        })
          .then((response) => {
            if (response.ok) {
              alert("Account deleted successfully.");
              signOut();
            } else {
              return Promise.reject("Failed to delete account.");
            }
          })
          .catch((error) => {
            alert("Failed to delete account. Please try again.");
          });
      }}
    >
      {t("delete-account")}
    </button>
  );
}
