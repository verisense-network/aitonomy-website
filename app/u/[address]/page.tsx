"use client";

import { use } from "react";
import UserProfile from "@/components/user/Profile";
import Threads from "@/components/home/Threads";

export default function UserAddress({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);

  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto py-4 md:flex md:space-x-4">
        <UserProfile address={address} />
        <Threads userAddress={address} isShowPostButton={false} />
      </div>
    </div>
  );
}
