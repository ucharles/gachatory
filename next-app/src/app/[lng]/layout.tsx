import { dir } from "i18next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Noto_Sans_JP } from "next/font/google";
import Navbar from "@/app/[lng]/components/navbar";
import { Footer } from "@/app/[lng]/components/Footer/client";
import TenstackProvider from "./components/Providers/TenstackProvider";

import "@/app/global.css";

const noto = Noto_Sans_JP({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
});

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gachatory",
  description: "Gachatory",
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: { lng: string };
}

export default function RootLayout({
  children,
  params: { lng },
}: RootLayoutProps) {
  let font;

  if (lng === "ko") {
    font = "font-Pretendard";
  } else if (lng === "ja") {
    font = noto.className;
  } else {
    font = inter.className;
  }

  return (
    <html lang={lng} dir={dir(lng)}>
      <body
        className={`${font} container bg-[#FEFEFE] w-[1280px] ${noto.variable}`}
      >
        <TenstackProvider>
          <div>
            <Navbar lng={lng} />
            {children}
            <Footer lng={lng} />
          </div>
        </TenstackProvider>
      </body>
    </html>
  );
}
