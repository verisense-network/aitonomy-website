"use client";

import { useCallback } from "react";
import CreateMenu from "./header/CreateMenu";
import UserMenu from "./header/UserMenu";
import { Badge, Image } from "@heroui/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HeaderSearch from "./header/Search";

export default function Header() {
  const router = useRouter();

  const toHomePage = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <header className="fixed top-0 left-0 w-full h-16 border-b dark:bg-black dark:border-zinc-800 z-50">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        <div className="flex-shrink-0 cursor-pointer" onClick={toHomePage}>
          <Badge
            placement="bottom-right"
            showOutline={false}
            variant="flat"
            classNames={{
              badge: "bg-transparent",
            }}
            content={
              <p className="text-[8px] md:text-[10px] text-center leading-2.5 mt-2 md:mt-0 -ml-5 md:-ml-27">
                Powered by
                <Link
                  className="ml-1 text-primary"
                  href="https://x.com/veri_sense"
                  target="_blank"
                >
                  Verisense
                </Link>
              </p>
            }
          >
          <Image
            src="/aitonomy-s.svg"
            alt="AItonomy.world"
            className="w-[50px] block md:hidden"
          />
          <Image
            src="/aitonomy-h.svg"
            alt="AItonomy.world"
            className="w-[180px] hidden md:block"
          />
          </Badge>
        </div>
        <div className="max-w-xl w-full mx-4">
          <HeaderSearch />
        </div>
        <div className="flex-shrink-0 flex space-x-1 md:space-x-5 items-center">
          <CreateMenu />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
