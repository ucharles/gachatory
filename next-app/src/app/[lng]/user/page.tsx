import { redirect } from "next/navigation";

export default async function Page({
  params: { lng },
}: {
  params: { lng: string };
}) {
  // redirect to /${lng}/user/dashboard
  redirect(`/${lng}/user/dashboard`);
}
