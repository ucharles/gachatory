import Link from "next/link";
import { translate } from "@/app/i18n";

export default async function UserAside({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const { t } = await translate(lng, "translation");

  return (
    <aside className="mr-6 hidden basis-1/4 sm:block">
      <h1 className="font-YgJalnan text-2xl text-gigas-700 lg:text-3xl">
        {t("mypage")}
      </h1>
      <div className="mb-5 mt-3 h-[1px] bg-gray-200"></div>
      <div className="space-y-3 text-small-medium">
        <p>
          <Link href={`/${lng}/like-list`}>{t("like-list")}</Link>
        </p>
        {/* <p>
          <Link href={`/${lng}/user/dashboard`}>{t("keyword-sub")}</Link>
        </p> */}
        <p>
          <Link href={`/${lng}/user/account`}>{t("account-info")}</Link>
        </p>
      </div>
    </aside>
  );
}
