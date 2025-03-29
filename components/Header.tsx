"use client";

import { useCallback } from "react";
import CreateMenu from "./header/CreateMenu";
import UserMenu from "./header/UserMenu";
import { Badge, Image, Input } from "@heroui/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Power, SearchIcon } from "lucide-react";

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
              <p className="text-[8px] md:text-[10px] text-center text-wrap leading-2.5 -ml-5">
                Powered by
                <Link
                  className="ml-1 text-verisense"
                  href="https://x.com/veri_sense"
                  target="_blank"
                >
                  Verisense
                </Link>
              </p>
            }
          >
            <Image
              src="/logo.svg"
              alt="AItonomy.world Logo"
              className="w-5 h-10 md:w-7 md:h-11 object-contain bg-top mb-2 text-gray-400"
            />
          </Badge>
        </div>
        <div className="max-w-xl w-full mx-4">
          <Input
            startContent={<SearchIcon className="h-5 w-5 text-gray-400" />}
            type="text"
            placeholder="Search"
          />
        </div>
        <div className="flex-shrink-0 flex items-center space-x-1 md:space-x-5">
          <CreateMenu />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
