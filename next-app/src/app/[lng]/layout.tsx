import { dir } from "i18next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Noto_Sans_JP } from "next/font/google";
import localFont from "next/font/local";
import Navbar from "@/components/navbar/Navbar";
import { Footer } from "@/app/[lng]/components/Footer/client";
import TenstackProvider from "../../components/Providers/TenstackProvider";
import { AuthProvider } from "../../components/Providers/AuthProvider";
const GTM_MEASUREMENT_ID = process.env.NEXT_PUBLIC_MEASUREMENT_ID;

import "@/app/global.css";
import GoogleTagManager from "./components/GoogleTagManager";
import NaverAnalytics from "./components/NaverAnalytics";

import { Toaster } from "@/components/ui/toaster";

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

export async function generateMetadata({
  params: { lng },
}: {
  params: { lng: string; id: string };
}): Promise<Metadata> {
  const gachatoryLoc: { [key: string]: string } = {
    ja: "ガチャトリー - Gachatory",
    en: "Gachatory",
    ko: "가챠토리 - Gachatory",
  };
  const gachatoryDesc: { [key: string]: string } = {
    ja: "お気に入りのカプセルトイを探してみよう！",
    en: "Find your favorite capsule toy!",
    ko: "좋아하는 캡슐 토이를 찾아보세요!",
  };
  return {
    title: gachatoryLoc[lng],
    description: gachatoryDesc[lng],
    openGraph: {
      title: gachatoryLoc[lng],
      description: gachatoryDesc[lng],
      type: "website",
    },
  };
}

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
        {GTM_MEASUREMENT_ID ? (
          <GoogleTagManager gtm_id={GTM_MEASUREMENT_ID} />
        ) : null}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />
      </head>
      <body className={`${font} ${noto.variable} relative bg-background-white`}>
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_MEASUREMENT_ID}" height="0" width="0" style="display: none; visibility: hidden;"></iframe>`,
          }}
        />
        <AuthProvider>
          <TenstackProvider>
            <Navbar lng={lng} />
            <div className="container max-w-[1200px] px-6 pb-20 pt-4 xl:px-0">
              {children}
            </div>
            <Footer lng={lng} />
          </TenstackProvider>
        </AuthProvider>
        <NaverAnalytics />
        <Toaster />
      </body>
    </html>
  );
}
