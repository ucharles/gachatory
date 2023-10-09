import { dir } from "i18next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Noto_Sans_JP } from "next/font/google";
import localFont from "next/font/local";
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

const pretendard = localFont({
  src: "../../../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "400",
  style: "normal",
});

export const metadata: Metadata = {
  title: "Gachatory",
  openGraph: {
    title: "Gachatory",
  },
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
    font = pretendard.className;
  } else if (lng === "ja") {
    font = noto.className;
  } else {
    font = inter.className;
  }

  return (
    <html lang={lng} dir={dir(lng)}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />
      </head>
      <body className={`${font} ${noto.variable} relative bg-background-white`}>
        <TenstackProvider>
          <Navbar lng={lng} />
          <div className="container w-[1200px]">{children}</div>
          <Footer lng={lng} />
        </TenstackProvider>
      </body>
    </html>
  );
}
