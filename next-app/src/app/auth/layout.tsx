import type { Metadata } from "next";
import { Inter } from "next/font/google";

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

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${inter.className} container max-w-5xl bg-[#F0EFF3]`}>
        <div className="flex h-screen">{children}</div>
      </body>
    </html>
  );
}
