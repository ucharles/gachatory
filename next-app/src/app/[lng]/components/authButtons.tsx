"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import google_icon from "../../../../public/images/google-icon.png";
import github_icon from "../../../../public/images/github-icon.png";
import discord_icon from "../../../../public/images/discord-icon.png";

export function GoogleSignInButton() {
  const handleClick = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <button
      className="hover:bg-gray-100 text-black font-semibold py-2 px-4 rounded flex items-center space-x-2 border w-full shadow"
      onClick={handleClick}
    >
      <Image src={google_icon} alt="Google" width={32} height={32} />
      <span>Sign in with Google</span>
    </button>
  );
}

export function GithubSignInButton() {
  const handleClick = () => {
    signIn("github", { callbackUrl: "/" });
  };

  return (
    <button
      className="hover:bg-gray-100 text-black font-semibold py-2 px-4 rounded flex items-center space-x-2 border w-full shadow"
      onClick={handleClick}
    >
      <Image src={github_icon} alt="GitHub" width={32} height={32} />
      <span>Sign in with GitHub</span>
    </button>
  );
}

export function DiscordSignInButton() {
  const handleClick = () => {
    signIn("discord", { callbackUrl: "/" });
  };

  return (
    <button
      className="hover:bg-gray-100 text-black font-semibold py-2 px-4 rounded flex items-center space-x-2 border w-full shadow"
      onClick={handleClick}
    >
      <Image src={discord_icon} alt="Discord" width={32} height={32} />
      <span>Sign in with Discord</span>
    </button>
  );
}
