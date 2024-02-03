import { Metadata } from "next";

import getQueryClient from "../../components/Providers/getQueryClient";
import { dehydrate } from "@tanstack/query-core";
import Hydrate from "../../components/Providers/HydrateClient";
import CapsuleInfo from "../../components/CapsuleInfo";
import { capsuleFetchData } from "@/lib/fetch-data";
import { cookies } from "next/headers";

const API_URI = process.env.APP_SERVER_URL || "";

export async function generateMetadata({
  params: { lng, id },
}: {
  params: { lng: string; id: string };
}): Promise<Metadata> {
  const data = await capsuleFetchData(id, lng);
  return {
    title: data.name,
    description: data.description,
    openGraph: {
      title: data.name,
      description: data.description,
      images: [{ url: data.img, width: 560, height: 560 }],
      type: "website",
    },
  };
}

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
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:pt-5">
        <CapsuleInfo lng={lng} queryKey={["capsule", id, lng]} id={id} />
      </div>
    </Hydrate>
  );
}
