"use client";

import { SWRConfig } from "swr";
import { HeroUIProvider } from "@heroui/react";
import { ToastContainer } from "react-toastify";
import { Onborda, OnbordaProvider } from "onborda";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import RainbowProvider from "@/lib/rainbow";
import { tours } from "@/components/tour/steps";
import CustomCard from "@/components/tour/CustomCard";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <ToastContainer autoClose={3500} toastClassName="mt-1 max-w-[98vw]" />
        <SWRConfig
          value={{
            refreshInterval: 30000,
            fetcher: (resource, init) =>
              fetch(resource, init).then((res) => res.json()),
          }}
        >
          <OnbordaProvider>
            <Onborda cardComponent={CustomCard} steps={tours}>
              <RainbowProvider>{children}</RainbowProvider>
            </Onborda>
          </OnbordaProvider>
        </SWRConfig>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
