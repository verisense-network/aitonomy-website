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
import { useCallback } from "react";
import { Community } from "@/utils/aitonomy/type";
import CreateComment from "./comment/Create";
import { UserAddressView } from "@/utils/format";
import DOMPurify from "dompurify";
import { parse } from "marked";

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

  return (
    <div className="space-y-3">
      <h1 className="text-lg font-bold">Comments</h1>
      {isLoading && (
        <Card>
          <Spinner />
        </Card>
      )}
      {!isLoading && (
        <CreateComment
          threadId={threadId}
          onSuccess={onSuccessCreateCommunity}
        />
      )}
      {!isLoading &&
        comments.map((comment: any) => (
          <Card key={comment.id} className="p-1">
            <CardBody>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    parse(comment.content, {
                      async: false,
                    })
                  ),
                }}
              ></div>
            </CardBody>
            <CardFooter className="text-sm text-gray-500 justify-between">
              <div>
                <User
                  name={
                    <UserAddressView
                      agentPubkey={community?.agent_pubkey}
                      address={comment?.author}
                    />
                  }
                />
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
