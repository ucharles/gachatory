"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { translate } from "@/app/i18n/client";

function setNotifications() {
  return fetch(`/api/notifications/view-all`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export default function NotificationConfirmButton({ lng }: { lng: string }) {
  const { t } = translate(lng, "tags");
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: setNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationCount"] });
    },
  });
  return (
    <button
      className="rounded-md bg-slate-100 px-2 py-2 text-sm hover:bg-slate-300"
      onClick={() => mutate()}
    >
      {t("confirm-all")}
    </button>
  );
}
