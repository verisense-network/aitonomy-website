"use client";

import useMeilisearch from "@/hooks/useMeilisearch";
import {
  Card,
  CardFooter,
  CardHeader,
  Chip,
  Pagination,
  User,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { parseId } from "@/utils/thread";
import { formatTimestamp } from "@/utils/tools";

export const ListboxWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full px-1 py-2 rounded-small">{children}</div>
);

export default function Threads() {
  const { data, setParams } = useMeilisearch("thread");
  const router = useRouter();

  const toThreadPage = useCallback(
    (key: string) => {
      const thread = data?.hits.find((hit: any) => hit.id === key);
      if (!thread) {
        return;
      }
      const { community: communityId, thread: threadNumber } = parseId(
        thread.id
      );
      router.push("/c/" + communityId + "/" + threadNumber);
    },
    [data?.hits, router]
  );

  const pageChange = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }))
  }, [setParams])

  return (<>
    <div className="max-w-7xl mx-auto space-y-2">
      {data?.hits?.map((hit: any) => (
        <Card className="w-full p-2" key={hit.id} onPress={() => toThreadPage(hit.id)} isPressable>
          <CardHeader>
            <h1 className="text-xl font-bold">{hit.title}</h1>
          </CardHeader>
          <CardFooter className="text-sm text-gray-500 justify-between">
            <div>
              <User name={hit.author} />
            </div>
            <div className="flex space-x-2 items-center">
              <Chip>
                {hit.formatedId.community}
              </Chip>
              <div>{formatTimestamp(hit.created_time)}</div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
    <Pagination className="mt-2" isCompact showControls initialPage={1} page={(data as any)?.page} total={(data as any)?.totalPages || 0} onChange={pageChange} />
  </>
  );
}
