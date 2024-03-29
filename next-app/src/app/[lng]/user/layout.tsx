import { getServerSession } from "next-auth/next";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

import UserAside from "./components/UserAside";

interface LayoutProps {
  children: React.ReactNode;
  params: { lng: string };
}

export default async function UserLayout({
  children,
  params: { lng },
}: LayoutProps) {
  const session = await getServerSession(options);

  if (session === null) {
    redirect("/");
  }

  return (
    <div className="flex">
      <aside className="mr-6 hidden sm:block sm:basis-1/4 md:basis-1/5">
        <UserAside params={{ lng }} />
      </aside>
      <main className="basis-full sm:basis-3/4 md:basis-4/5">{children}</main>
    </div>
  );
}
