"use client";

import useMeilisearch from "@/hooks/useMeilisearch";
import { formatTimestamp, sleep } from "@/utils/tools";
import {
  BreadcrumbItem,
  Breadcrumbs,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Spinner,
  User,
} from "@heroui/react";
import { useCallback, useEffect } from "react";
import { UserAddressView } from "@/utils/format";
import { parseMarkdown } from "@/utils/markdown";
import { useRouter } from "next/navigation";
import { decompressString } from "@/utils/compressString";
import Link from "next/link";

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

  const content = decompressString(threadData?.content || "");

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
    <div className="w-full">
      <Breadcrumbs className="m-2">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href={`/c/${threadData?.formattedId?.community}`}>
          {threadData?.community_name}
        </BreadcrumbItem>
        <BreadcrumbItem>{threadData?.title}</BreadcrumbItem>
      </Breadcrumbs>
      <Card className="m-2 mt-5 p-2 min-h-20">
        {isLoading && <Spinner />}
        {!isLoading && threadData && (
          <>
            <CardHeader>
              <h1 className="text-xl font-bold">{threadData.title}</h1>
            </CardHeader>
            <CardBody>
              <div
                className="prose max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html: parseMarkdown(content),
                }}
              />
            </CardBody>
            <CardFooter className="text-sm text-gray-500 justify-between">
              <div>
                <Link href={`/u/${threadData.author}`}>
                  <User
                    className="cursor-pointer"
                    avatarProps={{
                      name: threadData.author,
                    }}
                    name={
                      <UserAddressView
                        agentPubkey={""}
                        address={threadData.author}
                      />
                    }
                  />
                </Link>
              </div>
              <div className="flex space-x-2 items-center">
                <div>{formatTimestamp(threadData.created_time)}</div>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
