import Image from "next/image";
import google_icon from "public/images/google-icon.png";
import github_icon from "public/images/github-icon.png";
import discord_icon from "public/images/discord-icon.png";

function providerIconSelector(provider: string) {
  switch (provider) {
    case "google":
      return google_icon;
    case "github":
      return github_icon;
    case "discord":
      return discord_icon;
    default:
      return "";
  }
}

export default function ProviderIcon({
  provider,
}: {
  provider?: string | null;
}) {
  return (
    <Image
      src={providerIconSelector(provider ?? "")}
      alt={provider ?? ""}
      width={24}
      height={24}
      className="rounded-full"
    />
  );
}
