import getQueryClient from "../../components/Providers/getQueryClient";
import { dehydrate } from "@tanstack/query-core";
import Hydrate from "../../components/Providers/HydrateClient";
import CapsuleInfo from "../../components/CapsuleInfo";
import { capsuleFetchData } from "@/lib/fetch-data";
import { cookies } from "next/headers";

const API_URI = process.env.APP_SERVER_URL || "";

export default async function Page({
  params: { lng, id },
}: {
  params: { lng: string; id: string };
}) {
  const cookie = cookies();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(["capsule", id, lng], () => {
    return capsuleFetchData(id, lng, cookie);
  });
  const dehydratedState = dehydrate(queryClient);

  return (
    <Hydrate state={dehydratedState}>
      <div className="grid grid-cols-2 gap-8 md:pt-5 lg:pt-5 xl:pt-5 fold:grid-cols-1 3xs:grid-cols-1 2xs:grid-cols-1 xs:grid-cols-1">
        <CapsuleInfo lng={lng} queryKey={["capsule", id, lng]} id={id} />
      </div>
    </Hydrate>
  );
}
