import { getServerSession } from "next-auth/next";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import SignOutButton from "@/app/auth/components/SignOutButton";
import { capitalizeFirstLetter } from "@/lib/string-utils";
import { Session, ISODateString } from "next-auth";

interface MySession extends Session {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    provider?: string | null;
  };
  expires: ISODateString;
}

export default async function Page({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const session: MySession | null = await getServerSession(options);

  if (session === null) {
    redirect("/");
  }

  return (
    <main className="space-y-5">
      <h1 className="text-2xl">
        {capitalizeFirstLetter(session.user?.name as string)}
      </h1>
      <article className="flex space-x-10">
        <div>
          <p>Email</p>
          <p>Provider</p>
        </div>
        <div>
          <p>{session.user?.email}</p>
          <p>
            {capitalizeFirstLetter(session.user?.provider as string) ??
              "unknown"}
          </p>
        </div>
      </article>
      <article className="flex justify-end">
        <SignOutButton />
      </article>
    </main>
  );
}
