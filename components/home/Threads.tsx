"use client";

import { useMeilisearch } from "@/hooks/useMeilisearch";
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Pagination,
  Spinner,
  User,
} from "@heroui/react";
import { useCallback } from "react";
import { hexToLittleEndian } from "@/utils/tools";
import { twMerge } from "tailwind-merge";
import CreateThread from "../community/thread/Create";
import { decompressString } from "@/utils/compressString";
import Link from "next/link";
import TooltipTime from "../formatTime/TooltipTime";
import RenderMarkdown from "../markdown/RenderMarkdown";

export const ListboxWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full px-1 py-2 rounded-small">{children}</div>
);

interface ThreadsProps {
  className?: string;
  communityId?: string;
  userAddress?: string;
  isShowPostButton?: boolean;
}

export default function Threads({
  className,
  communityId,
  userAddress,
  isShowPostButton,
}: ThreadsProps) {
  const { data: communities, forceUpdate } = useMeilisearch(
    "community",
    undefined,
    {
      filter: `id = "${hexToLittleEndian(communityId || "")}"`,
      limit: 1,
    }
  );

  const community = communities?.hits[0];

  const filterWithCommunity = communityId
    ? `id CONTAINS ${hexToLittleEndian(communityId)}`
    : "";
  const filterWithUser = userAddress ? `author = "${userAddress}"` : "";
  const filter = `${filterWithCommunity}${
    filterWithUser
      ? `${filterWithCommunity ? " AND " : ""}${filterWithUser}`
      : ""
  }`;

  const { isLoading, data, setParams } = useMeilisearch("thread", undefined, {
    sort: ["created_time:desc"],
    page: 1,
    hitsPerPage: 7,
    filter,
  });

  const pageChange = useCallback(
    (page: number) => {
      setParams((prev) => ({ ...prev, page }));
    },
    [setParams]
  );

  return (
    <div className={twMerge("w-full px-2 mx-auto", className)}>
      <h1 className="py-4 text-lg font-bold">Threads</h1>
      <div className="space-y-3">
        {isLoading && <Spinner />}
        {isShowPostButton && !isLoading && (
          <CreateThread
            community={community}
            reloadCommunity={forceUpdate}
            onSuccess={() => {}}
          />
        )}
        {!isLoading && data?.hits?.length === 0 && (
          <div className="p-2">
            <h1 className="text-xl">No threads found</h1>
          </div>
        )}
        <div>
          {data?.hits?.map((hit: any, index: number) => (
            <div key={hit.id}>
              <Card
                as={Link}
                href={`/c/${hit.formattedId.community}/${hit.formattedId.thread}`}
                className="w-full p-2"
                classNames={{
                  base: "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900",
                }}
                isPressable
              >
                <CardHeader className="pb-0">
                  <div className="flex space-x-2 items-center text-sm">
                    <User
                      avatarProps={{
                        size: "sm",
                        name: hit.community_name,
                      }}
                      name={hit.community_name}
                    />
                    <span className="text-gray-500">•</span>
                    <TooltipTime time={hit.created_time} />
                  </div>
                </CardHeader>
                <CardBody>
                  <h1 className="text-xl font-bold mb-2">{hit.title}</h1>
                  <RenderMarkdown
                    content={decompressString(hit.content || "")}
                    truncate={120}
                  />
                </CardBody>
              </Card>
              {index !== data?.hits?.length - 1 && <Divider className="my-1" />}
            </div>
          ))}
        </div>
      </div>
      <Pagination
        className="mt-2"
        isCompact
        showControls
        initialPage={1}
        page={(data as any)?.page}
        total={(data as any)?.totalPages || 1}
        onChange={pageChange}
      />
    </div>
  );
}
