import TooltipTime from "@/components/formatTime/TooltipTime";
import { decompressString } from "@/utils/compressString";
import { UserAddressView } from "@/utils/format";
import { Button, Card, CardBody, CardFooter, User } from "@heroui/react";
import { BotIcon, Reply } from "lucide-react";
import { isEqualAddress } from "../utils";
import Link from "next/link";
import CreateComment from "./Create";
import { useCallback, useState } from "react";
import RenderMarkdown from "@/components/markdown/RenderMarkdown";

interface CommentProps {
  comment: any;
  community: any;
  threadId: string;
  isShowReply?: boolean;
  viewCommentAccount: (address: string) => string;
  forceUpdate: () => void;
}

function Content({
  comment,
  community,
  threadId,
  isShowReply,
  viewCommentAccount,
  forceUpdate,
}: CommentProps) {
  const [showCreate, setShowCreate] = useState(false);

  const onSuccessCreateCommunity = useCallback(() => {
    forceUpdate();
  }, [forceUpdate]);

  return (
    <>
      <Card className="p-1">
        <CardBody>
          <RenderMarkdown
            className="w-full rounded-xl"
            markdown={decompressString(comment.content || "")}
          />
        </CardBody>
        <CardFooter className="flex flex-wrap items-center text-sm text-gray-500 justify-between">
          <div className="flex items-center space-x-2">
            <Link
              href={
                isEqualAddress(comment?.author, community?.agent_pubkey)
                  ? `/c/${comment.formattedId.community}`
                  : `/u/${comment.author}`
              }
            >
              <User
                className="cursor-pointer"
                avatarProps={{
                  ...(isEqualAddress(comment?.author, community?.agent_pubkey)
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
                    creator={community?.creator}
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
            {isShowReply && (
              <Button
                className="ml-4"
                isIconOnly
                variant="flat"
                size="sm"
                onPress={() => setShowCreate(!showCreate)}
              >
                <Reply className="w-5 h-5" />
              </Button>
            )}
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
      {showCreate && (
        <div className="ml-6 mt-2">
          <CreateComment
            threadId={threadId}
            community={community}
            replyTo={comment.id}
            mention={[comment.author]}
            onSuccess={onSuccessCreateCommunity}
          />
        </div>
      )}
    </>
  );
}

export default function Comment({
  comment,
  community,
  threadId,
  isShowReply,
  viewCommentAccount,
  forceUpdate,
}: CommentProps) {
  return (
    <div>
      <Content
        comment={comment}
        community={community}
        threadId={threadId}
        isShowReply={isShowReply}
        viewCommentAccount={viewCommentAccount}
        forceUpdate={forceUpdate}
      />
      {comment.replies?.length ? (
        <div className="ml-6 my-2">
          {comment.replies.map((reply: any) => (
            <Comment
              key={reply.id}
              comment={reply}
              community={community}
              threadId={threadId}
              isShowReply={isShowReply}
              viewCommentAccount={viewCommentAccount}
              forceUpdate={forceUpdate}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
