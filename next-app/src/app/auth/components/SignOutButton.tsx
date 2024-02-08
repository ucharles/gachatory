"use client";
import { signOut } from "next-auth/react";
import { translate } from "@/app/i18n/client";

interface ISignOutButtonProps {
  lng: string;
  className?: string;
}
export default function SignOutButton({ lng, className }: ISignOutButtonProps) {
  const { t } = translate(lng, "account");
  return (
    <button onClick={() => signOut()} className={className}>
      {t("sign-out")}
    </button>
  );
}
