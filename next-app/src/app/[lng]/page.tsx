import { translate } from "../i18n";
import { dateTranslator } from "@/lib/date-converter";
import getQueryClient from "./components/Providers/getQueryClient";
import { dehydrate } from "@tanstack/query-core";
import Hydrate from "./components/Providers/HydrateClient";
import CapsuleCards from "./components/CapsuleCards";
import { arrivalFetchData } from "@/lib/fetch-data";
import { getCurrentMonthForSearch } from "@/lib/search-date-string";

export default async function Page({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(["arrivalCapsules", lng], () => {
    return arrivalFetchData(lng);
  });
  const dehydratedState = dehydrate(queryClient);

  // const data = await fetchData(lng);
  const { t } = await translate(lng);

  return (
    <div className="p-3">
      <h1 className="text-heading3-bold pb-6">
        {t("new-arrival")} ({dateTranslator(getCurrentMonthForSearch(), lng)})
      </h1>
      <Hydrate state={dehydratedState}>
        <CapsuleCards
          lng={lng}
          queryKey={["arrivalCapsules", lng]}
          pageName="arrival"
        />
      </Hydrate>
    </div>
  );
}
