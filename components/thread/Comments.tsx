"use client";

import useMeilisearch from "@/hooks/useMeilisearch";
import { decodeId } from "@/utils/thread";
import { formatTimestamp, hexToLittleEndian } from "@/utils/tools";
import { Card, CardBody, CardFooter, Chip, Pagination, Spinner, User } from "@heroui/react";
import { useCallback } from "react";

export default function ThreadComments({ threadId }: { threadId: string }) {
  const { community, thread } = decodeId(threadId);
  const { data, isLoading, setParams } = useMeilisearch('comment', undefined, {
    sort: ["created_time:desc"],
    filter: `id CONTAINS ${hexToLittleEndian(thread)}${hexToLittleEndian(community)}`
  });

  const comments = data?.hits ?? [];

  const pageChange = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }))
  }, [setParams])

  return (
    <div className="space-y-3">
      <h1 className="text-lg font-bold">Comments</h1>
      {isLoading && <Card><Spinner /></Card>}
      {!isLoading && (
        comments.map((comment: any) => (
          <Card key={comment.id} className="p-1">
            <CardBody>
              {comment.content}
            </CardBody>
            <CardFooter className="text-sm text-gray-500 justify-between">
              <div>
                <User name={comment.author} />
              </div>
              <div className="flex space-x-2 items-center">
                <div>{formatTimestamp(comment.created_time)}</div>
              </div>
            </CardFooter>
          </Card>
        ))
      )}
      <Pagination className="mt-2" isCompact showControls initialPage={1} page={(data as any)?.page} total={(data as any)?.totalPages || 1} onChange={pageChange} />
    </div>
  );
}
