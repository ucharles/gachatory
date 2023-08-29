import { dir } from "i18next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/app/[lng]/components/navbar";
import { Footer } from "@/app/[lng]/components/Footer/client";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gotcha-Story",
  description: "Gotcha-Story",
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
      <body className={inter.className}>
        <Navbar lng={lng} />
        {children}
        <Footer lng={lng} />
      </body>
    </html>
  );
}
