import { translate } from "../../../i18n";
import { FooterBase } from "./footer-base";

interface FooterProps {
  lng: string;
}

export async function Footer({ lng }: FooterProps) {
  const { t } = await translate(lng, "footer");
  return <FooterBase t={t} lng={lng} />;
}
