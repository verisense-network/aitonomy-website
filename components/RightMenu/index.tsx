"use client";

import { useAppearanceStore } from "@/stores/appearance";
import { twMerge } from "tailwind-merge";

export default function RightMenu() {
  const { sideBarIsOpen } = useAppearanceStore();

  return (
    <div className={twMerge(sideBarIsOpen ? "w-[200px]" : "w-1 md:w-12")} />
  );
}
