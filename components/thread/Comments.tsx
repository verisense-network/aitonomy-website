"use client";

import useMeilisearch from "@/hooks/useMeilisearch";
import { formatTimestamp } from "@/utils/tools";
import { Card, CardBody, CardFooter, Chip, Spinner, User } from "@heroui/react";

export default function ThreadComments({ threadId }: { threadId: string }) {
  const { data, isLoading } = useMeilisearch('comment', threadId);

  console.log("data", data)

  const comments = data?.hits ?? [];

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
                <Chip>
                  {comment.formatedId.community}
                </Chip>
                <div>{formatTimestamp(comment.created_time)}</div>
              </div>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
}
