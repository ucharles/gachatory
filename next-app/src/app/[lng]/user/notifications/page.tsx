import { cookies } from "next/headers";

import { dehydrate } from "@tanstack/react-query";

import getQueryClient from "@/components/Providers/getQueryClient";
import Hydrate from "@/components/Providers/HydrateClient";
import { getNotifications } from "@/lib/fetch-data";
import { translate } from "@/app/i18n/index";
import Notification from "@/components/notifications/Notification";
import NotificationConfirmButton from "@/components/notifications/NotificationConfirmButton";

import { type Language, Notification as INotification } from "@/lib/types";

export default async function NotificationsPage({
  params: { lng },
}: {
  params: { lng: Language };
}) {
  const cookie = cookies();
  const queryClient = getQueryClient();
  const { t } = await translate(lng, "translation");

  await queryClient.prefetchQuery<INotification[]>({
    queryKey: ["notifications"],
    queryFn: () => {
      return getNotifications(lng, cookie);
    },
  });

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-3xl font-bold">{t("notification")}</h2>
        <NotificationConfirmButton lng={lng} />
      </div>
      <Hydrate state={dehydrate(queryClient)}>
        <Notification lng={lng} />
      </Hydrate>
    </section>
  );
}
