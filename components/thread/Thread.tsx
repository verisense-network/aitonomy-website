"use client";

import {
  Avatar,
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
import { Community } from "@verisense-network/vemodel-types";

interface ThreadViewProps {
  thread: any;
  community: Community;
}

export default function ThreadView({ thread, community }: ThreadViewProps) {
  const [threadAccount, setThreadAccount] = useState<GetAccountInfoResponse>({
    address: "",
    alias: "",
    last_post_at: 0,
    max_invite_block: 0,
    nonce: 0,
  });

  const content = decompressString(thread?.content || "");

  useEffect(() => {
    if (!thread?.author) return;

    if (!threadAccount.address) {
      return;
    }

    (async () => {
      const userAddress = thread?.author;

      const { success, data } = await getAccountInfo({
        accountId: userAddress,
      });

      if (!success || !data) return;

      setThreadAccount(data);
    })();
  }, [thread, threadAccount.address]);

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
          <div className="flex items-center space-x-1">
            <Avatar
              name={community.name.slice(0, 2)}
              src={community.logo}
              size="sm"
              classNames={{
                base: "w-5 h-5",
              }}
            />
            <Link href={`/c/${thread?.formattedId?.community}`}>
              {thread?.community_name}
            </Link>
          </div>
        </BreadcrumbItem>
        <BreadcrumbItem>{thread?.title}</BreadcrumbItem>
      </Breadcrumbs>
      <Card className="m-2 mt-5 p-2 min-h-20">
        <CardHeader className="flex flex-wrap justify-between space-y-2">
          <h1 className="text-xl font-bold">{thread.title}</h1>
          <div className="flex justify-end">
            <ShareButtons
              title={thread.title}
              url={typeof window !== "undefined" ? window.location.href : ""}
            />
          </div>
        </CardHeader>
        <CardBody>
          <RenderMarkdown content={content} />
        </CardBody>
        <CardFooter className="text-sm text-gray-500 justify-between">
          <div>
            <Link href={`/u/${thread.author}`}>
              <User
                className="cursor-pointer"
                avatarProps={{
                  name: threadAccount?.alias || thread.author,
                }}
                name={
                  <UserAddressView
                    creator={community?.creator}
                    address={threadAccount?.address || thread.author}
                    name={threadAccount?.alias || thread.author}
                  />
                }
              />
            </Link>
          </div>
          <div className="flex space-x-2 items-center">
            <TooltipTime time={thread.created_time} />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
