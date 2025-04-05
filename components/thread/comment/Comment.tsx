import TooltipTime from "@/components/formatTime/TooltipTime";
import RenderMarkdown from "@/components/markdown/RenderMarkdown";
import { decompressString } from "@/utils/compressString";
import { UserAddressView } from "@/utils/format";
import { Card, CardBody, CardFooter, User } from "@heroui/react";
import { BotIcon } from "lucide-react";
import { isEqualAddress } from "../utils";
import Link from "next/link";

interface CommentProps {
  comment: any;
  community: any;
  viewCommentAccount: (address: string) => string;
  key: string;
}

function Content({
  comment,
  community,
  viewCommentAccount,
  key,
}: CommentProps) {
  return (
    <Card key={key} className="p-1">
      <CardBody>
        <RenderMarkdown content={decompressString(comment.content || "")} />
      </CardBody>
      <CardFooter className="flex flex-wrap items-center text-sm text-gray-500 justify-between">
        <div>
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
  );
}

export default function Comment({
  comment,
  community,
  viewCommentAccount,
}: CommentProps) {
  return (
    <div>
      <Content
        key={comment.id}
        comment={comment}
        community={community}
        viewCommentAccount={viewCommentAccount}
      />
      {comment.replies?.length ? (
        <div className="ml-6 mt-2">
          {comment.replies.map((reply: any) => (
            <Comment
              key={reply.id}
              comment={reply}
              community={community}
              viewCommentAccount={viewCommentAccount}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
