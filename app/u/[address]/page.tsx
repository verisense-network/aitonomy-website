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
    <div className="w-full mx-auto py-4 md:flex md:space-x-4">
      <div className="w-full md:w-2/5">
        <UserProfile address={address} />
      </div>
      <div className="w-full md:w-3/5">
        <Threads userAddress={address} isShowPostButton={false} />
      </div>
    </div>
  );
}
