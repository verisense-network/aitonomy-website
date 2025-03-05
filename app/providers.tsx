"use client";

import { SWRConfig } from "swr";
import { HeroUIProvider } from "@heroui/react";
import { ToastContainer } from "react-toastify";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ToastContainer autoClose={3500} toastClassName="mt-1 max-w-[98vw]" />
      <SWRConfig
        value={{
          refreshInterval: 30000,
          fetcher: (resource, init) =>
            fetch(resource, init).then((res) => res.json()),
        }}
      >
        {children}
      </SWRConfig>
    </HeroUIProvider>
  );
}
