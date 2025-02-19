'use client';

import useThreads from "@/hooks/useThreads"
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/react";

export default function ThreadView({ threadId }: { threadId: string }) {
  const { data } = useThreads({
    search: threadId
  })

  const threadData = data?.hits[0]

  return (
    <div>
      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold">{threadData?.title}</h1>
        </CardHeader>
        <CardBody>
          {threadData?.content}
        </CardBody>
        <CardFooter className="text-sm text-gray-500 justify-between">
          <div>
            {threadData?.author}
          </div>
          <div>
            {threadData?.created_time}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}