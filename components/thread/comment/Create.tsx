import { createComment } from "@/app/actions";
import { signPayload } from "@/utils/aitonomy/sign";
import { PostCommentPayload } from "@/utils/aitonomy/type";
import { decodeId } from "@/utils/thread";
import { hexToBytes, hexToLittleEndian } from "@/utils/tools";
import { Form, Button, Card, Spinner } from "@heroui/react";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import ContentEditor from "../../mdxEditor/ContentEditor";
import { CreateCommentArg } from "@/utils/aitonomy";
import { useUserStore } from "@/stores/user";
import {
  extractMarkdownImages,
  extractMentions,
  mentionsToAccountId,
} from "@/utils/markdown";
import { compressString } from "@/utils/compressString";
import { Lock } from "@/components/Lock";
import { MentionProvider } from "@/components/mdxEditor/mentionCtx";
import { Mention } from "@/components/mdxEditor/AddMention";
import { updateAccountInfo } from "@/utils/user";

interface Props {
  threadId: string;
  communityAgentPubkey: string;
  replyTo?: string;
  onSuccess: (id: string) => void;
}

export interface CreateCommentParams {
  thread: string;
  content: string;
  image?: string;
  mention: string[];
  reply_to?: string;
}

export default function CreateComment({
  threadId,
  communityAgentPubkey,
  replyTo,
  onSuccess,
}: Props) {
  const { isLogin, lastPostAt } = useUserStore();
  // accounts for mention
  const [accounts, setAccounts] = useState<Mention[]>([]);

  const { control, handleSubmit, reset } = useForm<CreateCommentParams>({
    defaultValues: {
      thread: threadId,
      image: "",
      content: "",
      mention: [],
      reply_to: replyTo,
    },
  });

  const onSubmit = useCallback(
    async (data: CreateCommentParams) => {
      if (!isLogin) {
        toast.info("Please login first");
        return;
      }

      console.log(data);

      const toastId = toast.loading(
        "Posting, continue to complete in your wallet"
      );

      try {
        const images = extractMarkdownImages(data.content);
        const content = compressString(data.content);
        const mention = extractMentions(data.content);
        const payload = {
          ...data,
          content: Array.from(content),
          thread: hexToBytes(data.thread),
          images,
          mention: mentionsToAccountId(mention),
          reply_to: data.reply_to ? hexToBytes(data.reply_to) : undefined,
        } as CreateCommentArg;

        console.log("payload", payload);

        const signature = await signPayload(payload, PostCommentPayload);

        const contentId = await createComment(payload, signature);
        console.log("contentId", contentId);
        if (!contentId) return;

        const { comment } = decodeId(hexToLittleEndian(contentId));

        toast.update(toastId, {
          render: "post a comment success",
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });
        onSuccess(comment!);
        reset();
      } catch (e: any) {
        console.error("e", e);
        toast.update(toastId, {
          render: `failed: ${e?.message || e?.toString()}`,
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    },
    [isLogin, onSuccess, reset]
  );

  useEffect(() => {
    updateAccountInfo();
    setAccounts([
      {
        name: "Agent",
        address: communityAgentPubkey,
      },
    ]);
  }, [communityAgentPubkey]);

  return (
    <Card className="relative">
      <MentionProvider
        value={{
          accounts,
          setAccounts,
        }}
      >
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Lock countdownTime={lastPostAt || 0} />
          <Controller
            name="content"
            control={control}
            rules={{
              required: "Please enter comment",
            }}
            render={({ field, fieldState }) => (
              <Suspense fallback={<Spinner />}>
                <ContentEditor
                  className="w-full border-1 rounded-xl"
                  {...field}
                  markdown={field.value}
                  contentEditableClassName="min-h-44 !pb-10"
                />
                {fieldState.error?.message && (
                  <p className="absolute bottom-2 left-2 text-sm text-red-500">
                    {fieldState.error.message}
                  </p>
                )}
              </Suspense>
            )}
          />
          <Button type="submit" className="absolute bottom-2 right-2 z-20">
            Submit
          </Button>
        </Form>
      </MentionProvider>
    </Card>
  );
}
