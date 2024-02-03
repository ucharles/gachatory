import {
  GoogleSignInButton,
  GithubSignInButton,
  DiscordSignInButton,
} from "@/app/[lng]/components/authButtons";
import Image from "next/image";
import Link from "next/link";
import logo from "../../../../public/images/pnglogo.png";
import { getServerSession } from "next-auth/next";
import { options } from "../../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const session = await getServerSession(options);

  let OAuthAccountNotLinked = false;
  if (searchParams.error === "OAuthAccountNotLinked") {
    OAuthAccountNotLinked = true;
  }

  if (session) {
    redirect("/");
  }

  return (
    <div className="m-auto flex w-96 flex-col items-center justify-center rounded-3xl bg-white">
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-10 flex justify-center">
          <Link href="/">
            <Image priority src={logo} alt="Gachatory" width={175} />
          </Link>
        </div>
        {OAuthAccountNotLinked ? (
          <div className="w-60 rounded-lg bg-yellow-100 p-3 text-sm">
            To confirm your identity, sign in with the same account you used
            originally.
          </div>
        ) : null}
        <div className="my-5 space-y-4">
          <GoogleSignInButton />
          <hr className="border-gray-200" />
          <GithubSignInButton />
          <hr className="border-gray-200" />
          <DiscordSignInButton />
        </div>
      </div>
    </div>
  );
}
