import { dir } from "i18next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/app/[lng]/components/navbar";
import { Footer } from "@/app/[lng]/components/Footer/client";

import "@/app/global.css";

const inter = Inter({ subsets: ["latin"] });

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
  return (
    <html lang={lng} dir={dir(lng)}>
      <body className={`${inter.className} container bg-[#FEFEFE] w-[1280px]`}>
        <div>
          <Navbar lng={lng} />
          {children}
          <Footer lng={lng} />
        </div>
      </body>
    </html>
  );
}
