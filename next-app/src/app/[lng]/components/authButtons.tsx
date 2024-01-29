"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import google_icon from "../../../../public/images/google-icon.png";
import github_icon from "../../../../public/images/github-icon.png";
import discord_icon from "../../../../public/images/discord-icon.png";

const buttonStyle =
  "flex w-full items-center space-x-6 py-2 pl-1 pr-10 font-semibold text-black hover:bg-gray-100 rounded-lg";

export function GoogleSignInButton() {
  const handleClick = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <button className={buttonStyle} onClick={handleClick}>
      <Image src={google_icon} alt="Google" width={48} height={48} />
      <span>Sign in with Google</span>
    </button>
  );
}

export function GithubSignInButton() {
  const handleClick = () => {
    signIn("github", { callbackUrl: "/" });
  };

  return (
    <button className={buttonStyle} onClick={handleClick}>
      <Image src={github_icon} alt="GitHub" width={48} height={48} />
      <span>Sign in with GitHub</span>
    </button>
  );
}

export function DiscordSignInButton() {
  const handleClick = () => {
    signIn("discord", { callbackUrl: "/" });
  };

  return (
    <button className={buttonStyle} onClick={handleClick}>
      <Image src={discord_icon} alt="Discord" width={48} height={48} />
      <span>Sign in with Discord</span>
    </button>
  );
}
