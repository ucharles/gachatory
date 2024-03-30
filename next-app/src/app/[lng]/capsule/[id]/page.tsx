import { Metadata } from "next";
import { cookies } from "next/headers";

import getQueryClient from "../../../../components/Providers/getQueryClient";
import { dehydrate } from "@tanstack/query-core";
import Hydrate from "../../../../components/Providers/HydrateClient";
import CapsuleInfo from "../../components/CapsuleInfo";
import { capsuleFetchData } from "@/lib/fetch-data";

export async function generateMetadata({
  params: { lng, id },
}: {
  params: { lng: string; id: string };
}): Promise<Metadata> {
  const data = await capsuleFetchData(id, lng);
  const gachatoryLoc: { [key: string]: string } = {
    ja: "ガチャトリー",
    en: "Gachatory",
    ko: "가챠토리",
  };
  return {
    title: `${data.name} - ${gachatoryLoc[lng]}`,
    description: data.description,
    openGraph: {
      title: data.name,
      description: data.description,
      images: [{ url: data.img, width: 300, height: 300 }], // Must be an absolute URL
      type: "website",
    },
  };
}

export default async function Page({
  params: { lng, id },
}: {
  params: { lng: string; id: string };
}) {
  const queryClient = getQueryClient();
  const cookie = cookies();
  await queryClient.prefetchQuery(["capsule", id, lng], () => {
    return capsuleFetchData(id, lng, cookie);
  });
  const dehydratedState = dehydrate(queryClient);

  return (
    <Hydrate state={dehydratedState}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 md:pt-5">
        <CapsuleInfo lng={lng} queryKey={["capsule", id, lng]} id={id} />
      </div>
    </Hydrate>
  );
}
