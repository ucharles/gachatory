import Link from "next/link";

import SignOutButton from "@/app/auth/components/SignOutButton";

interface IUserInfoOverlayProps {
  lng: string;
}
export default function UserInfoOverlay({ lng }: IUserInfoOverlayProps) {
  return (
    <div className="space-y-3 rounded-lg bg-bg-footer p-5 text-sm">
      <p>
        <Link href={`/${lng}/user/dashboard`}>마이페이지</Link>
      </p>
      <p>
        <Link href={`/${lng}/user/account`}>계정 설정</Link>
      </p>
      <SignOutButton />
    </div>
  );
}
