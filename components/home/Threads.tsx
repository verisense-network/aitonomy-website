"use client";

import useMeilisearch from "@/hooks/useMeilisearch";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Pagination,
  Spinner,
  User,
} from "@heroui/react";
import { useTransitionRouter } from "next-view-transitions";
import { useCallback } from "react";
import { decodeId } from "@/utils/thread";
import { formatTimestamp, hexToLittleEndian } from "@/utils/tools";
import { twMerge } from "tailwind-merge";
import CreateThread from "../community/thread/Create";
import { UserAddressView } from "@/utils/format";
import { parseMarkdown } from "@/utils/markdown";
import truncateHtml from "truncate-html";
import { useTheme } from "next-themes";

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
  const router = useTransitionRouter();
  const { theme } = useTheme();

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

  const toThreadPage = useCallback(
    (key: string) => {
      const thread = data?.hits.find((hit: any) => hit.id === key);
      if (!thread) {
        return;
      }
      const { community: communityId, thread: threadNumber } = decodeId(
        thread.id
      );
      router.push("/c/" + communityId + "/" + threadNumber);
    },
    [data?.hits, router]
  );

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
            communityName={community?.name}
            reloadCommunity={forceUpdate}
            onSuccess={() => {}}
          />
        )}
        {data?.hits?.length === 0 && (
          <div className="p-2">
            <h1 className="text-xl">No threads found</h1>
          </div>
        )}
        {data?.hits?.map((hit: any) => (
          <Card
            className="w-full p-2"
            key={hit.id}
            onPress={() => toThreadPage(hit.id)}
            isPressable
          >
            <CardHeader>
              <h1 className="text-xl font-bold">{hit.title}</h1>
            </CardHeader>
            <CardBody>
              <div
                className="prose max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html: truncateHtml(
                    parseMarkdown(hit.content),
                    120
                  ) as string,
                }}
              ></div>
            </CardBody>
            <CardFooter className="flex flex-col space-y-2 text-sm text-gray-500 items-start md:flex-row md:justify-between">
              <div>
                <User
                  name={
                    <UserAddressView agentPubkey={""} address={hit.author} />
                  }
                />
              </div>
              <div className="flex space-x-2 items-center">
                <Chip>{hit.community_name}</Chip>
                <div>{formatTimestamp(hit.created_time)}</div>
              </div>
            </CardFooter>
          </Card>
        ))}
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
