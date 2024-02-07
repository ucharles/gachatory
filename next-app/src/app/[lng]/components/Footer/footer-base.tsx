"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Trans } from "react-i18next/TransWithoutContext";
import { languages } from "../../../i18n/settings";
import { TFunction } from "i18next";
import bigLogo from "../../../../../public/images/pnglogo.png";

interface FooterBaseProps {
  t: TFunction;
  lng: string;
}

export function FooterBase({ t, lng }: FooterBaseProps) {
  // Extract the language from the URL
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // extract pathname index 4~end
  const otherPath = pathname.split("/").slice(2).join("/");

  return (
    <footer className="bg-bg-footer pb-16 pt-10">
      <div className="container max-w-[1200px] space-y-5 px-6 xl:px-0">
        <article>
          <Link href={`/${lng}`}>
            <Image
              priority
              src={bigLogo}
              alt="logo"
              width={200}
              height={32}
              className="h-auto w-44"
            />
          </Link>
        </article>
        <article className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
          <div className="flex space-x-2">
            <div>
              <Trans i18nKey="languageSwitcher" t={t} values={{ lng }}>
                LNG:
              </Trans>
            </div>
            <div>
              <select
                id="languageSwitcher"
                value={lng}
                onChange={(e) => {
                  const selectedLng = e.target.value;
                  const href = `/${selectedLng}/${otherPath}${
                    searchParams ? "?" + searchParams.toString() : ""
                  }`;
                  window.location.href = href; // 페이지 리디렉션
                }}
                className="border-none bg-transparent"
              >
                {languages.map((l) => (
                  <option key={l} value={l}>
                    {l.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Link href={`/${lng}/privacy-policy`}>{t("privacy-policy")}</Link>
          </div>
        </article>
      </div>
    </footer>
  );
}
