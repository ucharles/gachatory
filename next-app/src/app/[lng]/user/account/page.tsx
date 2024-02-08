import { getServerSession } from "next-auth/next";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import SignOutButton from "@/app/auth/components/SignOutButton";
import { capitalizeFirstLetter } from "@/lib/string-utils";
import { Session, ISODateString } from "next-auth";
import { convertToLocalTime } from "@/lib/date-converter";
import DeleteAccountButton from "@/app/auth/components/DeleteAccountButton";
import ProviderIcon from "@/app/[lng]/user/components/ProviderIcon";

import EmailNotification from "../components/EmailNotification";

import { translate } from "@/app/i18n";

export interface MySession extends Session {
  user?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    provider?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
  };
  expires: ISODateString;
}

export default async function Page({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const { t } = await translate(lng, "account");

  const session: MySession | null = await getServerSession(options);
  console.log(session);

  if (session === null) {
    redirect("/");
  }

  return (
    <main className="w-full text-gray-700">
      <h1 className="mb-10 text-3xl font-bold">{t("account-info")}</h1>
      <article className="mb-16 flex space-x-20 text-base">
        <div className="space-y-8 font-bold">
          <p>{t("email")}</p>
          <p>{t("join-date")}</p>
          {/* <p>{t("email-noti")}</p> */}
        </div>
        <div className="space-y-8">
          <p className="flex space-x-3">
            <span>{session.user?.email}</span>
            <span>
              <ProviderIcon provider={session.user?.provider} />
            </span>
          </p>
          <p>
            {session.user?.createdAt
              ? convertToLocalTime(session.user?.createdAt)
              : "unknown"}
          </p>
          {/* <EmailNotification /> */}
        </div>
      </article>
      <hr className="w-full py-4"></hr>
      <article className="flex justify-between">
        <SignOutButton lng={lng} />
        <DeleteAccountButton lng={lng} user={session.user} />
      </article>
    </main>
  );
}
