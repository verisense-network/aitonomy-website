"use client";

import useMeilisearch from "@/hooks/useMeilisearch";
import { formatTimestamp } from "@/utils/tools";
import { Card, CardBody, CardFooter, Chip, Pagination, Spinner, User } from "@heroui/react";
import { useCallback } from "react";

export default function ThreadComments({ threadId }: { threadId: string }) {
  const { data, isLoading, setParams } = useMeilisearch('comment', threadId);

  const comments = data?.hits ?? [];

  const pageChange = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }))
  }, [setParams])

  return (
    <div className="space-y-3">
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
      <Pagination className="mt-2" isCompact showControls initialPage={1} page={(data as any)?.page} total={(data as any)?.totalPages || 0} onChange={pageChange} />
    </div>
  );
}
