import Link from "next/link";

export default function UserAside({
  params: { lng },
}: {
  params: { lng: string };
}) {
  return (
    <aside className="mr-6 basis-1/4 3xs:hidden 2xs:hidden xs:hidden">
      <h1 className="font-YgJalnan text-3xl text-gigas-700">MY PAGE</h1>
      <div className="mb-5 mt-3 h-[1px] bg-gray-200"></div>
      <div className="space-y-3 text-small-medium">
        <p>
          <Link href={`/${lng}/like-list`}>좋아요 목록</Link>
        </p>
        <p>
          <Link href={`/${lng}/user/dashboard`}>키워드 알림 설정</Link>
        </p>
        <p>
          <Link href={`/${lng}/user/account`}>계정 설정</Link>
        </p>
      </div>
    </aside>
  );
}
