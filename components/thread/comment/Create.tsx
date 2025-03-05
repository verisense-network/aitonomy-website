import { createComment } from "@/app/actions";
import { signPayload } from "@/utils/aitonomy/sign";
import { PostCommentPayload } from "@/utils/aitonomy/type";
import { decodeId } from "@/utils/thread";
import { hexToBytes, hexToLittleEndian } from "@/utils/tools";
import { Form, Button, Card, Spinner } from "@heroui/react";
import { Suspense, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import ContentEditor from "../../mdxEditor/ContentEditor";
import { CreateCommentArg } from "@/utils/aitonomy";
import { useUserStore } from "@/store/user";

interface Props {
  threadId: string;
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

export default function CreateComment({ threadId, replyTo, onSuccess }: Props) {
  const { isLogin } = useUserStore();
  const { control, handleSubmit } = useForm<CreateCommentParams>({
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
        toast.info("You need to login first");
        return;
      }

      console.log(data);

      const toastId = toast.loading(
        "Posting, continue to complete in your wallet"
      );

      try {
        const image = data.content.match(/!\[(.*?)\]\((.*?)\)/);
        console.log("image", image);
        const payload = {
          ...data,
          thread: hexToBytes(data.thread),
          image: image ? image[2] : undefined,
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
    [isLogin, onSuccess]
  );

  return (
    <Card className="relative">
      <Form onSubmit={handleSubmit(onSubmit)}>
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
        <Button type="submit" className="absolute bottom-2 right-2 z-50">
          Submit
        </Button>
      </Form>
    </Card>
  );
}
