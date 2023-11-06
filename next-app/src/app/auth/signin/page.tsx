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
    <div className="mt-20 flex h-screen flex-col items-center justify-start">
      {OAuthAccountNotLinked ? (
        <div className="mb-5 w-60 rounded-lg bg-yellow-100 p-3">
          To confirm your identity, sign in with the same account you used
          originally.
        </div>
      ) : (
        null
      )}
      <div className="">
        <div className="flex justify-center pb-10">
          <Link href="/">
            <Image priority src={logo} alt="Gachatory" width={220} />
          </Link>
        </div>
        <div className="space-y-5">
          <GoogleSignInButton />
          <GithubSignInButton />
          <DiscordSignInButton />
        </div>
      </div>
    </div>
  );
}
