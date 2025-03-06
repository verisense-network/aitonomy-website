"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { HomeModernIcon } from "@heroicons/react/24/solid";
import { useCallback } from "react";
import { useTransitionRouter } from "next-view-transitions";
import CreateMenu from "./header/CreateMenu";
import UserMenu from "./header/UserMenu";

export default function Header() {
  const router = useTransitionRouter();

  const toHomePage = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <header className="h-16 border-b dark:border-zinc-800 z-50">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between md:px-0">
        <div className="flex-shrink-0 cursor-pointer" onClick={toHomePage}>
          <HomeModernIcon
            width={60}
            height={40}
            className="object-contain text-gray-400"
          />
        </div>
        <div className="max-w-xl w-full mx-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search"
            />
          </div>
        </div>
        <div className="flex-shrink-0 flex space-x-5">
          <CreateMenu />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
