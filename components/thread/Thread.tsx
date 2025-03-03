"use client";

import useMeilisearch from "@/hooks/useMeilisearch";
import { formatTimestamp, sleep } from "@/utils/tools";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Spinner,
  User,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { isYouAddress } from "./utils";

export default function ThreadView({ threadId }: { threadId: string }) {
  const router = useRouter();
  const { data, isLoading, isValidating, forceUpdate } = useMeilisearch(
    "thread",
    undefined,
    {
      filter: `id = ${threadId}`,
    }
  );

  const threadData = data?.hits[0];

  const toComunityPage = useCallback(
    (communityId: string) => {
      router.push("/c/" + communityId);
    },
    [router]
  );

  useEffect(() => {
    (async () => {
      if (isLoading || isValidating) return;

      if (!data?.hits?.length) {
        console.log("not found force update");
        await sleep(1500);
        forceUpdate();
        return;
      }
      const hasThread = data?.hits?.some((hit: any) => hit.id === threadId);
      if (!hasThread) {
        console.log("not has");
        await sleep(1500);
        console.log("not has force update");
        forceUpdate();
      }
    })();
  }, [data, forceUpdate, isLoading, isValidating, threadId]);

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
                <User
                  name={
                    isYouAddress(threadData.author) ? "You" : threadData.author
                  }
                />
              </div>
              <div className="flex space-x-2 items-center">
                <Chip
                  onClick={() =>
                    toComunityPage(threadData.formattedId?.community)
                  }
                  className="cursor-pointer"
                >
                  {threadData.community_name}
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
