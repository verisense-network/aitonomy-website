"use client";

import { useMeilisearchInfinite } from "@/hooks/useMeilisearch";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Spinner,
  User,
} from "@heroui/react";
import { useMemo } from "react";
import { twMerge } from "tailwind-merge";
import CreateThread from "../community/thread/Create";
import { decompressString } from "@/utils/compressString";
import Link from "next/link";
import TooltipTime from "../formatTime/TooltipTime";
import RenderMarkdown from "../markdown/RenderMarkdown";
import { sort } from "radash";
import { Community } from "@verisense-network/vemodel-types";

export const ListboxWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full px-1 py-2 rounded-small">{children}</div>
);

interface ThreadsProps {
  className?: string;
  community?: Community;
  userAddress?: string;
  isShowPostButton?: boolean;
}

export default function Threads({
  className,
  community,
  userAddress,
  isShowPostButton,
}: ThreadsProps) {
  const filterWithCommunity = community ? `id CONTAINS ${community.id}` : "";
  const filterWithUser = userAddress ? `author = "${userAddress}"` : "";
  const filter = `${filterWithCommunity}${
    filterWithUser
      ? `${filterWithCommunity ? " AND " : ""}${filterWithUser}`
      : ""
  }`;

  const { data, isLoading, isValidating, hasMore, loadMore } =
    useMeilisearchInfinite("thread", undefined, {
      sort: ["created_time:desc"],
      page: 1,
      hitsPerPage: 12,
      filter,
    });

  const threads = useMemo(() => {
    if (!data) return [];

    const allThreads = data.flatMap((page) => page.hits);
    return sort(allThreads, (thread: any) => -thread.created_time);
  }, [data]);

  return (
    <div className={twMerge("w-full px-2 mx-auto", className)}>
      <h1 className="py-4 text-lg font-bold">Threads</h1>
      <div className="space-y-3">
        {isLoading && <Spinner />}
        {isShowPostButton && !isLoading && (
          <CreateThread
            community={community as Community}
            onSuccess={() => {}}
          />
        )}
        {!isLoading && threads?.length === 0 && (
          <div className="p-2">
            <h1 className="text-xl">No threads found</h1>
          </div>
        )}
        <div>
          {threads?.map((thread: any, index: number) => (
            <div key={thread.id}>
              <Card
                as={Link}
                href={`/c/${thread.formattedId.community}/${thread.formattedId.thread}`}
                className="w-full p-2"
                classNames={{
                  base: "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800",
                }}
                isPressable
              >
                <CardHeader className="pb-0">
                  <div className="flex space-x-2 items-center text-sm">
                    <User
                      avatarProps={{
                        size: "sm",
                        name: thread.community_name,
                      }}
                      name={thread.community_name}
                    />
                    <span className="text-gray-500">•</span>
                    <TooltipTime time={thread.created_time} />
                  </div>
                </CardHeader>
                <CardBody>
                  <h1 className="text-xl font-bold mb-2">{thread.title}</h1>
                  <RenderMarkdown
                    content={decompressString(thread.content || "")}
                    truncate={120}
                  />
                </CardBody>
              </Card>
              {index !== threads?.length - 1 && <Divider className="my-1" />}
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          {hasMore && (
            <Button
              onPress={() => loadMore()}
              color="primary"
              isLoading={isLoading || isValidating}
            >
              Load More
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
