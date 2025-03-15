"use client";

import useMeilisearch from "@/hooks/useMeilisearch";
import { decodeId } from "@/utils/thread";
import { formatTimestamp, hexToLittleEndian } from "@/utils/tools";
import {
  Card,
  CardBody,
  CardFooter,
  Pagination,
  Spinner,
  User,
} from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { Community } from "@/utils/aitonomy/type";
import CreateComment from "./comment/Create";
import { UserAddressView } from "@/utils/format";
import { parseMarkdown } from "@/utils/markdown";
import { decompressString } from "@/utils/compressString";
import Link from "next/link";
import { GetAccountInfoResponse } from "@/utils/aitonomy";
import { getAccounts } from "@/app/actions";
import {
  ChatBubbleLeftEllipsisIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { isAgentAddress } from "./utils";

interface Props {
  threadId: string;
  community: Community;
  communityAgentPubkey: string;
}

export default function ThreadComments({
  threadId,
  community,
  communityAgentPubkey,
}: Props) {
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

  const comments = data?.hits ?? [];

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
      if (isLoading || !comments?.length) return;
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
      <h1 className="text-lg font-bold">Comments</h1>
      {isLoading && (
        <Card>
          <Spinner />
        </Card>
      )}
      {!isLoading && (
        <CreateComment
          threadId={threadId}
          communityAgentPubkey={communityAgentPubkey}
          onSuccess={onSuccessCreateCommunity}
        />
      )}
      {!isLoading &&
        comments.map((comment: any) => (
          <Card key={comment.id} className="p-1">
            <CardBody>
              <div
                className="prose max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html: parseMarkdown(
                    decompressString(comment.content || "")
                  ),
                }}
              />
            </CardBody>
            <CardFooter className="text-sm text-gray-500 justify-between">
              <div>
                <Link href={`/u/${comment.author}`}>
                  <User
                    className="cursor-pointer"
                    avatarProps={{
                      ...(isAgentAddress(
                        comment?.author,
                        community?.agent_pubkey
                      )
                        ? {
                            icon: (
                              <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
                            ),
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
                      />
                    }
                  />
                </Link>
              </div>
              <div className="flex space-x-2 items-center">
                <div>{formatTimestamp(comment.created_time)}</div>
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
