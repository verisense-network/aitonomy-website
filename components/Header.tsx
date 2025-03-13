"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useCallback } from "react";
import CreateMenu from "./header/CreateMenu";
import UserMenu from "./header/UserMenu";
import { Image, Input } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const toHomePage = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <header className="fixed top-0 left-0 w-full h-16 border-b dark:bg-black dark:border-zinc-800 z-50">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        <div className="flex-shrink-0 cursor-pointer" onClick={toHomePage}>
          <Image
            src="/logo.svg"
            alt="AItonomy.world Logo"
            className="w-7 h-12 md:w-8 md:h-14 object-contain text-gray-400"
          />
        </div>
        <div className="max-w-xl w-full mx-4">
          <Input
            startContent={
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            }
            type="text"
            placeholder="Search"
          />
        </div>
        <div className="flex-shrink-0 flex space-x-5">
          <CreateMenu />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
