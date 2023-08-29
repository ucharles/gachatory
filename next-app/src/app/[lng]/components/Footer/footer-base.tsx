"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Trans } from "react-i18next/TransWithoutContext";
import { languages } from "../../../i18n/settings";
import { TFunction } from "i18next";

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
    <footer style={{ marginTop: 50 }}>
      <Trans i18nKey="languageSwitcher" t={t} values={{ lng }}>
        Switch from <strong>{lng.toUpperCase()}</strong> to:{" "}
      </Trans>

      {languages
        .filter((l) => lng !== l)
        .map((l, index) => {
          return (
            <span key={l}>
              {index > 0 && " or "}
              <Link
                href={`/${l}/${otherPath}${
                  searchParams ? "?" + searchParams.toString() : null
                }`}
              >
                {l.toUpperCase()}
              </Link>
            </span>
          );
        })}
    </footer>
  );
}
