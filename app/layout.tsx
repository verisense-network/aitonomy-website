import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import Header from "@/components/Header";
import SideMenu from "@/components/sideMenu";
import RightMenu from "@/components/RightMenu";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Aitonomy Forum",
  description: "A community forum for Aitonomy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased min-h-full`}>
        <main>
          <Providers>
            <Header />
            <div className="flex">
              <SideMenu />
              <div className="w-[70vw] md:w-[1280px] mx-auto py-4 md:inline-flex md:space-x-4">
                {children}
              </div>
              <RightMenu />
            </div>
          </Providers>
        </main>
      </body>
    </html>
  );
}
