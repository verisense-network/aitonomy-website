"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  HomeModernIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import CreateMenu from "./header/CreateMenu";

export default function Header() {
  const router = useRouter();

  const toHomePage = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 z-50 dark:bg-gray-900 dark:border-gray-800">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          <div className="flex-shrink-0 cursor-pointer" onClick={toHomePage}>
            <HomeModernIcon
              width={60}
              height={40}
              className="object-contain text-gray-400"
            />
            {/* <Image
                  src=""
                  alt="Logo"
                  width={120}
                  height={40}
                  className="object-contain"
              /> */}
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
            <button className="flex items-center focus:outline-none">
              <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                {/* <Image */}
                {/*     src="" */}
                {/*     alt="User Avatar" */}
                {/*     width={32} */}
                {/*     height={32} */}
                {/*     className="h-full w-full object-cover" */}
                {/* /> */}
                <UserCircleIcon
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              </div>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
