"use client";

import { useMeilisearchInfinite } from "@/hooks/useMeilisearch";
import { hexToLittleEndian } from "@/utils/tools";
import { Button } from "@heroui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { sort } from "radash";
import { Community } from "@verisense-network/vemodel-types";
import CreateComment from "./comment/Create";
import { GetAccountInfoResponse } from "@/utils/aitonomy";
import { getAccounts } from "@/app/actions";
import Comment from "./comment/Comment";
import { decompressString } from "@/utils/compressString";
import { RefreshCwIcon } from "lucide-react";
import { updateLastPostAt } from "@/utils/user";

interface Props {
  thread: any;
  community: Community;
}

export default function ThreadComments({ thread, community }: Props) {
  const { data, isLoading, isValidating, hasMore, loadMore, forceUpdate } =
    useMeilisearchInfinite("comment", undefined, {
      sort: ["created_time:desc"],
      filter: `id CONTAINS ${hexToLittleEndian(
        thread?.formattedId?.thread
      )}${hexToLittleEndian(thread?.formattedId?.community)}`,
      hitsPerPage: 25,
    });

  const comments = useMemo(() => {
    if (!data) return [];

    const allComments = data.flatMap((page) => page.hits);

    const commentMap: Record<string, any> = {};
    allComments.forEach((comment) => {
      commentMap[comment.id] = {
        ...comment,
        c: decompressString(comment.content || ""),
        replies: [],
      };
    });

    const rootComments: any[] = [];
    const processedComments = new Set<string>();

    const addComment = (comment: any) => {
      if (processedComments.has(comment.id)) return;
      processedComments.add(comment.id);

      const commentWithReplies = commentMap[comment.id];
      if (comment.reply_to === null) {
        rootComments.push(commentWithReplies);
      } else {
        const parentComment = commentMap[comment.reply_to];
        if (parentComment) {
          if (!parentComment.replies) parentComment.replies = [];
          parentComment.replies.push(commentWithReplies);
          if (!processedComments.has(comment.reply_to)) {
            const parentCommentFull = allComments.find(
              (c) => c.id === comment.reply_to
            );
            if (parentCommentFull) addComment(parentCommentFull);
          }
        }
      }
    };

    allComments.forEach(addComment);

    const sortComments = (comments: any[]): any[] => {
      return sort(comments, (comment: any) => -comment.created_time).map(
        (comment) => ({
          ...comment,
          replies: sortComments(comment.replies),
        })
      );
    };

    return sortComments(rootComments);
  }, [data]);

  const onSuccessCreateCommunity = useCallback(() => {
    updateLastPostAt();
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
      <div className="flex justify-between items-center space-x-2">
        <h1 className="text-lg font-bold">Comments</h1>
        <Button
          variant="flat"
          size="sm"
          onPress={() => forceUpdate()}
          isIconOnly
        >
          <RefreshCwIcon />
        </Button>
      </div>
      <CreateComment
        threadId={thread.id}
        onSuccess={onSuccessCreateCommunity}
        community={community}
      />
      {!isLoading &&
        comments.map((comment: any) => (
          <div key={comment.id}>
            <Comment
              comment={comment}
              community={community}
              threadId={thread.id}
              viewCommentAccount={viewCommentAccount}
              forceUpdate={onSuccessCreateCommunity}
              isShowReply={true}
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
