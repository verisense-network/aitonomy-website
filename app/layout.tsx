import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { Providers } from "./providers";
import "./globals.css";
import Header from "@/components/Header";

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
    <ViewTransitions>
      <html lang="en">
        <body className={`${inter.variable} font-sans antialiased min-h-full`}>
          <main>
            <Providers>
              <Header />
              {children}
            </Providers>
          </main>
        </body>
      </html>
    </ViewTransitions>
  );
}
