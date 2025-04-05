"use client";

import { useMeilisearchInfinite } from "@/hooks/useMeilisearch";
import { decodeId } from "@/utils/thread";
import { hexToLittleEndian } from "@/utils/tools";
import { Button, Card, Spinner } from "@heroui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { sort } from "radash";
import { Community } from "@verisense-network/vemodel-types";
import CreateComment from "./comment/Create";
import { GetAccountInfoResponse } from "@/utils/aitonomy";
import { getAccounts } from "@/app/actions";
import Comment from "./comment/Comment";

interface Props {
  threadId: string;
  community: Community;
}

export default function ThreadComments({ threadId, community }: Props) {
  const { thread, community: communityId } = decodeId(threadId);
  const { data, isLoading, isValidating, hasMore, loadMore, forceUpdate } =
    useMeilisearchInfinite("comment", undefined, {
      sort: ["created_time:desc"],
      filter: `id CONTAINS ${hexToLittleEndian(thread)}${hexToLittleEndian(
        communityId
      )}`,
      hitsPerPage: 20,
    });

  const comments = useMemo(() => {
    if (!data) return [];

    const allComments = data.flatMap((page) => page.hits);

    const groupedReplies: Record<string, Set<any>> = {};

    allComments.forEach((comment) => {
      if (comment.reply_to !== null) {
        if (!groupedReplies[comment.reply_to]) {
          groupedReplies[comment.reply_to] = new Set();
        }
        groupedReplies[comment.reply_to].add(comment);
      }
    });

    const uniqueMainComments = allComments.filter(
      (comment) => comment.reply_to === null
    );

    const output = uniqueMainComments.map((comment) => ({
      ...comment,
      replies: groupedReplies[comment.id]
        ? Array.from(groupedReplies[comment.id])
        : [],
    }));

    return sort(output, (comment: any) => -comment.created_time);
  }, [data]);

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
      if (!address) return "";

      const account = commentAccounts.find(
        (account) => account.address === address
      );
      return account?.alias || address;
    },
    [commentAccounts]
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
          <div key={comment.id}>
            <Comment
              key={comment.id}
              comment={comment}
              community={community}
              viewCommentAccount={viewCommentAccount}
            />
          </div>
        ))}
      <div className="flex justify-center">
        {hasMore && (
          <Button
            onPress={() => loadMore()}
            color="primary"
            isLoading={isLoading || isValidating}
          >
            Load More
          </Button>
        )}
      </div>
    </div>
  );
}
