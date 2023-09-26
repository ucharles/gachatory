import getQueryClient from "../../components/Providers/getQueryClient";
import { dehydrate } from "@tanstack/query-core";
import Hydrate from "../../components/Providers/HydrateClient";
import { ICapsuleToy } from "@/lib/models/capsule-model";
import { cacheTimeEnum } from "@/lib/enums";
import CapsuleInfo from "../../components/CapsuleInfo";
import { capsuleFetchData } from "@/lib/fetch-data";

const API_URI = process.env.APP_SERVER_URL || "";

export default async function Page({
  params: { lng, id },
}: {
  params: { lng: string; id: string };
}) {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(["capsule", id, lng], () => {
    return capsuleFetchData(id, lng);
  });
  const dehydratedState = dehydrate(queryClient);

  return (
    <div className="grid grid-cols-2">
      <Hydrate state={dehydratedState}>
        <CapsuleInfo lng={lng} queryKey={["capsule", id, lng]} id={id} />
      </Hydrate>
    </div>
  );
}
