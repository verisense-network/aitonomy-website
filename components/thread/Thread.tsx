"use client";

import useMeilisearch from "@/hooks/useMeilisearch";
import { formatTimestamp } from "@/utils/tools";
import { Card, CardBody, CardFooter, CardHeader, Chip, Spinner, User } from "@heroui/react";

export default function ThreadView({ threadId }: { threadId: string }) {
  const { data, isLoading } = useMeilisearch('thread', threadId, {
    limit: 1
  });

  const threadData = data?.hits[0];

  return (
    <div>
      <Card className="p-2 min-h-20">
        {isLoading && <Spinner />}
        {!isLoading && threadData && (
          <>
            <CardHeader>
              <h1 className="text-xl font-bold">{threadData.title}</h1>
            </CardHeader>
            <CardBody>{threadData.content}</CardBody>
            <CardFooter className="text-sm text-gray-500 justify-between">
              <div>
                <User name={threadData.author} />
              </div>
              <div className="flex space-x-2 items-center">
                <Chip>
                  {threadData.formatedId.community}
                </Chip>
                <div>{formatTimestamp(threadData.created_time)}</div>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
