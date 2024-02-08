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
      <UserAside params={{ lng }} />
      {children}
    </div>
  );
}
