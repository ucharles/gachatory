import { translate } from "@/app/i18n";
import { cookies } from "next/headers";
import SearchTags from "@/components/tags/SearchTags";

import getQueryClient from "@/components/Providers/getQueryClient";
import Hydrate from "@/components/Providers/HydrateClient";
import { dehydrate } from "@tanstack/react-query";
import SubscribedTagList from "@/app/[lng]/user/components/SubscribedTagList";
import { getSubscribedTags, getTags } from "@/lib/fetch-data";

export default async function KeywordSubscription({ lng }: { lng: string }) {
  const cookie = cookies();
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["subscribedTags"],
    queryFn: () => getSubscribedTags(cookie),
  });

  // await queryClient.prefetchQuery({
  //   queryKey: ["tags", ""],
  //   queryFn: () => getTags(""),
  // });

  const { t } = await translate(lng, "tags");

  return (
    <Hydrate state={dehydrate(queryClient)}>
      <div className="space-y-7 opacity-80">
        <article className="space-y-4">
          <div className="space-y-3">
            <h1 className="text-heading2.5-bold">{t("subscribed-tags")}</h1>
            <p className="text-small-medium text-gray-500">
              {t("subscribed-tags-description")}
            </p>
            <SubscribedTagList lng={lng} />
          </div>
        </article>
        <article className="space-y-4">
          <div className="space-y-3">
            <h1 className="text-heading2.5-bold">
              {t("tag-notification-set")}
            </h1>
            <p className="text-small-medium text-gray-500">
              {t("tag-notification-set-description")}
            </p>
          </div>
          <SearchTags lng={lng} />
        </article>
      </div>
    </Hydrate>
  );
}
