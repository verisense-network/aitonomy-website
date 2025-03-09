"use client";

import { useSideMenuStore } from "@/store/sideMenu";
import { twMerge } from "tailwind-merge";

export default function RightMenu() {
  const { isOpen } = useSideMenuStore();

  return <div className={twMerge(isOpen ? "w-[200px]" : "w-12")} />;
}
