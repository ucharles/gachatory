import Link from "next/link";

import SignOutButton from "@/app/auth/components/SignOutButton";

import { translate } from "@/app/i18n/client";

interface IUserInfoOverlayProps {
  lng: string;
}
export default function UserInfoOverlay({ lng }: IUserInfoOverlayProps) {
  const { t } = translate(lng, "translation");
  return (
    <div className="space-y-3 rounded-lg bg-bg-footer p-5 text-sm">
      <p>
        <Link href={`/${lng}/user/dashboard`}>{t("mypage")}</Link>
      </p>
      <p>
        <Link href={`/${lng}/user/account`}>{t("account-info")}</Link>
      </p>
      <SignOutButton lng={lng} />
    </div>
  );
}
