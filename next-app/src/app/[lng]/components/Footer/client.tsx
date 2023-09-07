"use client";

import { FooterBase } from "./footer-base";
import { translate } from "../../../i18n/client";

interface FooterProps {
  lng: string;
}

export function Footer({ lng }: FooterProps) {
  const { t } = translate(lng, "footer");
  return <FooterBase t={t} lng={lng} />;
}
