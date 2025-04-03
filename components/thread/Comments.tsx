"use client";

import useMeilisearch from "@/hooks/useMeilisearch";
import { decodeId } from "@/utils/thread";
import { hexToLittleEndian } from "@/utils/tools";
import {
  Card,
  CardBody,
  CardFooter,
  Pagination,
  Spinner,
  User,
} from "@heroui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Community } from "@verisense-network/vemodel-types";
import CreateComment from "./comment/Create";
import { UserAddressView } from "@/utils/format";
import { decompressString } from "@/utils/compressString";
import Link from "next/link";
import { GetAccountInfoResponse } from "@/utils/aitonomy";
import { getAccounts } from "@/app/actions";
import { isEqualAddress } from "./utils";
import TooltipTime from "../formatTime/TooltipTime";
import { BotIcon } from "lucide-react";
import RenderMarkdown from "../markdown/RenderMarkdown";

interface Props {
  threadId: string;
  community: Community;
}

export default function ThreadComments({ threadId, community }: Props) {
  const { thread, community: communityId } = decodeId(threadId);
  const { data, isLoading, setParams, forceUpdate } = useMeilisearch(
    "comment",
    undefined,
    {
      sort: ["created_time:desc"],
      filter: `id CONTAINS ${hexToLittleEndian(thread)}${hexToLittleEndian(
        communityId
      )}`,
    }
  );

  const comments = useMemo(() => data?.hits || [], [data]);

  const pageChange = useCallback(
    (page: number) => {
      setParams((prev) => ({ ...prev, page }));
    },
    [setParams]
  );

  const onSuccessCreateCommunity = useCallback(() => {
    setTimeout(() => {
      forceUpdate();
    }, 2000);
  }, [forceUpdate]);

  const [commentAccounts, setCommentAccounts] = useState<
    GetAccountInfoResponse[]
  >([]);

  useEffect(() => {
    (async () => {
      if (isLoading || !comments.length) return;
      const accounts = comments.map((comment: any) => comment.author);
      const { success, data: accountsData } = await getAccounts({
        accountIds: accounts,
      });
      if (!success || !accountsData) return;
      setCommentAccounts(accountsData);
    })();
  }, [comments, isLoading]);

  const viewCommentAccount = useCallback(
    (address: string) => {
      if (!address || !commentAccounts?.length || isLoading) return "";

      const account = commentAccounts.find(
        (account) => account.address === address
      );
      return account?.alias || address;
    },
    [commentAccounts, isLoading]
  );

  return (
    <div className="mx-2 space-y-3">
      <div className="flex items-center space-x-2">
        <h1 className="text-lg font-bold">Comments</h1>
      </div>
      {!isLoading && (
        <CreateComment
          threadId={threadId}
          onSuccess={onSuccessCreateCommunity}
          community={community}
        />
      )}
      {isLoading && (
        <Card>
          <Spinner />
        </Card>
      )}
      {!isLoading &&
        comments.map((comment: any) => (
          <Card key={comment.id} className="p-1">
            <CardBody>
              <RenderMarkdown
                content={decompressString(comment.content || "")}
              />
            </CardBody>
            <CardFooter className="text-sm text-gray-500 justify-between">
              <div>
                <Link
                  href={
                    isEqualAddress(comment?.author, community?.agent_pubkey)
                      ? `/c/${decodeId(comment.id).community}`
                      : `/u/${comment.author}`
                  }
                >
                  <User
                    className="cursor-pointer"
                    avatarProps={{
                      ...(isEqualAddress(
                        comment?.author,
                        community?.agent_pubkey
                      )
                        ? {
                            icon: <BotIcon className="w-5 h-5" />,
                          }
                        : {
                            name: viewCommentAccount(comment?.author),
                          }),
                    }}
                    name={
                      <UserAddressView
                        agentPubkey={community?.agent_pubkey}
                        address={comment?.author}
                        name={viewCommentAccount(comment?.author)}
                        classNames={{
                          name: isEqualAddress(
                            comment?.author,
                            community?.agent_pubkey
                          )
                            ? "text-primary"
                            : "",
                        }}
                      />
                    }
                  />
                </Link>
              </div>
              <div className="flex space-x-2 items-center">
                <div className="flex space-x-5 items-center">
                  {isEqualAddress(comment?.author, community?.agent_pubkey) && (
                    <span className="text-xs text-gray-500">
                      AI-generated, for reference only
                    </span>
                  )}
                  <TooltipTime time={comment.created_time} />
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      <Pagination
        className="mt-2"
        isCompact
        showControls
        initialPage={1}
        page={(data as any)?.page}
        total={(data as any)?.totalPages || 1}
        onChange={pageChange}
      />
    </div>
  );
}
