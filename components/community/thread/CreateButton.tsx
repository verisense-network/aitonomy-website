"use client";

import { useUserStore } from "@/stores/user";
import { Card } from "@heroui/react";
import { useCallback } from "react";
import { toast } from "react-toastify";
import LockCountdown from "@/components/lock/LockCountdown";
import LockNotAllowedToPost from "@/components/lock/LockNotAllowedToPost";
import useCanPost from "@/hooks/useCanPost";
import { Community } from "@verisense-network/vemodel-types";
import { hexToLittleEndian } from "@/utils/tools";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  community?: Community;
}

export default function CreateThread({ community }: Props) {
  const { isLogin, lastPostAt } = useUserStore();
  const canPost = useCanPost(community);

  const communityId = community?.id ? hexToLittleEndian(community.id) : "";

  const toPostThreadPage = useCallback(async () => {
    if (!isLogin) {
      toast.info("Please login first");
      return;
    }
  }, [isLogin]);

  return (
    <>
      <div className="relative">
        {canPost ? (
          <LockCountdown countdownTime={lastPostAt || 0} />
        ) : (
          <LockNotAllowedToPost community={community} />
        )}
        <Card
          className="flex w-full text-right px-6 py-6 hover:bg-gray-200 dark:hover:bg-zinc-800"
          isPressable
          onPress={() => toPostThreadPage()}
          as={Link}
          href={
            isLogin
              ? `/post-thread${
                  communityId ? `?communityId=${communityId}` : ""
                }`
              : "#"
          }
        >
          <div className="flex items-center space-x-4">
            <span className="text-lg text-gray-500">Write something...</span>
          </div>
        </Card>
      </div>
    </>
  );
}
