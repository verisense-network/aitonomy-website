"use client";

import { useMeilisearch } from "@/hooks/useMeilisearch";
import { sleep } from "@/utils/tools";
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
import { useEffect, useState } from "react";
import { UserAddressView } from "@/utils/format";
import { decompressString } from "@/utils/compressString";
import Link from "next/link";
import ShareButtons from "../share/ShareButtons";
import { getAccountInfo } from "@/app/actions";
import { GetAccountInfoResponse } from "@/utils/aitonomy";
import TooltipTime from "../formatTime/TooltipTime";
import RenderMarkdown from "../markdown/RenderMarkdown";
import { HomeIcon } from "lucide-react";

export default function ThreadView({ threadId }: { threadId: string }) {
  const { data, isLoading, isValidating, forceUpdate } = useMeilisearch(
    "thread",
    undefined,
    {
      filter: `id = ${threadId}`,
    }
  );

  const threadData = data?.hits[0];
  const [threadAccount, setThreadAccount] = useState<GetAccountInfoResponse>({
    address: "",
    alias: "",
    last_post_at: 0,
    max_invite_block: 0,
    nonce: 0,
  });

  const content = decompressString(threadData?.content || "");

  useEffect(() => {
    if (!threadData?.author) return;

    (async () => {
      const userAddress = threadData?.author;

      const { success, data } = await getAccountInfo({
        accountId: userAddress,
      });

      if (!success || !data) return;

      setThreadAccount(data);
    })();
  }, [threadData]);

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
      <Breadcrumbs
        className="m-2"
        itemClasses={{
          item: "block max-w-62 truncate",
        }}
      >
        <BreadcrumbItem>
          <div className="flex items-center space-x-1">
            <HomeIcon className="h-4 w-4" />
            <Link href="/">Home</Link>
          </div>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link href={`/c/${threadData?.formattedId?.community}`}>
            {threadData?.community_name}
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem>{threadData?.title}</BreadcrumbItem>
      </Breadcrumbs>
      <Card className="m-2 mt-5 p-2 min-h-20">
        {isLoading && <Spinner />}
        {!isLoading && threadData && (
          <>
            <CardHeader className="flex flex-wrap justify-between space-y-2">
              <h1 className="text-xl font-bold">{threadData.title}</h1>
              <div className="flex justify-end">
                <ShareButtons title={threadData.title} url={location.href} />
              </div>
            </CardHeader>
            <CardBody>
              <RenderMarkdown content={content} />
            </CardBody>
            <CardFooter className="text-sm text-gray-500 justify-between">
              <div>
                <Link href={`/u/${threadData.author}`}>
                  <User
                    className="cursor-pointer"
                    avatarProps={{
                      name: threadAccount?.alias || threadData.author,
                    }}
                    name={
                      <UserAddressView
                        address={threadAccount?.address || threadData.author}
                        name={threadAccount?.alias || threadData.author}
                      />
                    }
                  />
                </Link>
              </div>
              <div className="flex space-x-2 items-center">
                <TooltipTime time={threadData.created_time} />
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
