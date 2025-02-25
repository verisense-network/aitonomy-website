"use client";

import useMeilisearch from "@/hooks/useMeilisearch";
import {
  Card,
  CardFooter,
  CardHeader,
  Chip,
  Pagination,
  Spinner,
  User,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { decodeId } from "@/utils/thread";
import { formatTimestamp, hexToLittleEndian } from "@/utils/tools";
import { twMerge } from "tailwind-merge";

export const ListboxWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full px-1 py-2 rounded-small">{children}</div>
);

interface ThreadsProps {
  className?: string;
  communityId?: string;
}

export default function Threads({ className, communityId }: ThreadsProps) {
  const router = useRouter();

  const { isLoading, data, setParams } = useMeilisearch("thread", undefined, {
    sort: ["created_time:desc"],
    filter: communityId
      ? `id CONTAINS ${hexToLittleEndian(communityId)}`
      : undefined,
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
    <div className={twMerge("w-full px-5 mx-auto", className)}>
      <h1 className="py-4 text-lg font-bold">Threads</h1>
      <div className="space-y-3">
        {isLoading && (
          <Spinner />
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
            <CardFooter className="text-sm text-gray-500 justify-between">
              <div>
                <User name={hit.author} />
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
