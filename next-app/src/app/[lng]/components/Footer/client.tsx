"use client";

import { FooterBase } from "./footer-base";
import { useTranslation } from "../../../i18n/client";

interface FooterProps {
  lng: string;
}

export function Footer({ lng }: FooterProps) {
  const { t } = useTranslation(lng, "footer");
  return <FooterBase t={t} lng={lng} />;
}
