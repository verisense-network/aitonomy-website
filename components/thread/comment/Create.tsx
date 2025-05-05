import { createComment } from "@/app/actions";
import { signPayload } from "@/utils/aitonomy/sign";
import { PostCommentPayload } from "@verisense-network/vemodel-types";
import { decodeId } from "@/utils/thread";
import { hexToLittleEndian } from "@/utils/tools";
import { Form, Button, Card, Spinner } from "@heroui/react";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { CreateCommentArg } from "@/utils/aitonomy";
import {
  extractMarkdownImages,
  extractMentions,
  mentionsToAccountId,
} from "@/utils/markdown";
import { compressString } from "@/utils/compressString";
import LockCountdown from "@/components/lock/LockCountdown";
import { MentionProvider } from "@/components/markdown/mentionCtx";
import { Mention } from "@/components/markdown/AddMention";
import { updateLastPostAt } from "@/utils/user";
import useCanPost from "@/hooks/useCanPost";
import LockNotAllowedToPost from "@/components/lock/LockNotAllowedToPost";
import { checkIndexed, meiliSearchFetcher } from "@/utils/fetcher/meilisearch";
import { useUser } from "@/hooks/useUser";
import dynamic from "next/dynamic";

interface Props {
  threadId: string;
  replyTo?: string;
  community: any;
  mention?: string[];
  onSuccess: (id: string) => void;
}

export interface CreateCommentParams {
  thread: string;
  content: string;
  images?: string[];
  mention: string[];
  reply_to?: string;
}

const MarkdownEditor = dynamic(
  () => import("@/components/markdown/MarkdownEditor"),
  {
    ssr: false,
  }
);

export default function CreateComment({
  threadId,
  replyTo,
  community,
  mention,
  onSuccess,
}: Props) {
  const { user } = useUser();
  const lastPostAt = user?.lastPostAt;
  const isLogin = user?.isLogin;
  // accounts for mention
  const [accounts, setAccounts] = useState<Mention[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const canPost = useCanPost(community);

  const { control, handleSubmit, reset } = useForm<CreateCommentParams>({
    defaultValues: {
      thread: threadId,
      content: "",
      images: [],
      mention: mention || [],
      reply_to: replyTo,
    },
  });

  const onSubmit = useCallback(
    async (data: CreateCommentParams) => {
      console.log("data", data);
      if (!isLogin) {
        toast.info("Please login first");
        return;
      }

      const toastId = toast.loading(
        "Posting, continue to complete in your wallet"
      );
      setIsLoading(true);
      try {
        const images = extractMarkdownImages(data.content);
        const content = compressString(data.content.trim());
        const mention = extractMentions(data.content);
        const payload = {
          ...data,
          content: Array.from(content),
          thread: `0x${hexToLittleEndian(data.thread)}`,
          images,
          mention: mentionsToAccountId(data.mention.concat(mention || [])),
          reply_to: data.reply_to
            ? `0x${hexToLittleEndian(data.reply_to)}`
            : undefined,
        } as CreateCommentArg;

        console.log("payload", payload);

        const signature = await signPayload(payload, PostCommentPayload);

        const {
          success,
          data: contentId,
          message: errorMessage,
        } = await createComment(payload, signature);
        if (!success) {
          throw new Error(errorMessage);
        }
        if (!contentId) return;
        toast.update(toastId, {
          render: "Comment indexing...",
          type: "success",
        });

        const { comment } = decodeId(hexToLittleEndian(contentId));

        const isIndexed = await checkIndexed(() =>
          meiliSearchFetcher("comment", undefined, {
            filter: `id = ${hexToLittleEndian(contentId)}`,
          })
        );
        if (isIndexed) {
          toast.update(toastId, {
            render: "Post a comment success",
            type: "success",
            isLoading: false,
            autoClose: 1500,
          });
          onSuccess(comment!);
          reset();
        } else {
          toast.update(toastId, {
            render: "Failed to index comment",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        }
        setIsLoading(false);
      } catch (e: any) {
        setIsLoading(false);
        console.error("e", e);
        toast.update(toastId, {
          render: `failed: ${e?.message || e?.toString()}`,
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
      updateLastPostAt(true);
    },
    [isLogin, onSuccess, reset]
  );

  useEffect(() => {
    updateLastPostAt();
    setAccounts([
      {
        name: "Agent",
        address: community?.agent_pubkey,
      },
    ]);
  }, [community]);

  return (
    <Card className="relative">
      <MentionProvider
        value={{
          accounts,
          setAccounts,
        }}
      >
        <Form onSubmit={handleSubmit(onSubmit)}>
          {canPost ? (
            <LockCountdown countdownTime={lastPostAt || 0} />
          ) : (
            <LockNotAllowedToPost community={community} />
          )}
          <Controller
            name="content"
            control={control}
            rules={{
              required: "Please enter comment",
            }}
            render={({ field, fieldState }) => (
              <Suspense fallback={<Spinner />}>
                <MarkdownEditor
                  className="w-full rounded-xl"
                  {...field}
                  markdown={field.value}
                  contentEditableClassName="min-h-44 max-h-[70vh] !pb-10"
                />
                {fieldState.error?.message && (
                  <p className="absolute bottom-2 left-2 text-sm text-red-500">
                    {fieldState.error.message}
                  </p>
                )}
              </Suspense>
            )}
          />
          <Button
            isLoading={isLoading}
            type="submit"
            className="absolute bottom-2 right-2 z-20"
          >
            Submit
          </Button>
        </Form>
      </MentionProvider>
    </Card>
  );
}
