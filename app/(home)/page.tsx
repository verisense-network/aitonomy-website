"use client";

import Threads from "@/components/home/Threads";
import Sidebar from "@/components/home/Sidebar";

export default function Home() {
  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto py-4 md:flex md:space-x-4">
        <Threads className="md:w-3/4" />
        <Sidebar className="md:w-1/4" />
      </div>
    </div>
  );
}
