import { createComment, CreateCommentParams } from "@/app/actions";
import { signPayload } from "@/utils/aitonomy/sign";
import { PostCommentPayload } from "@/utils/aitonomy/type";
import { decodeId } from "@/utils/thread";
import { hexToLittleEndian } from "@/utils/tools";
import { Form, Button, Card, Spinner } from "@heroui/react";
import { Suspense, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import ContentEditor from "../ContentEditor";

interface Props {
  threadId: string;
  replyTo?: string;
  onSuccess: (id: string) => void;
}

export default function CreateComment({ threadId, replyTo, onSuccess }: Props) {
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
      console.log(data);
      try {
        const payload = data as CreateCommentParams;

        const signature = await signPayload(payload, PostCommentPayload);

        const contentId = await createComment(payload, signature);
        console.log("contentId", contentId);
        if (!contentId) return;

        const { comment } = decodeId(hexToLittleEndian(contentId));

        toast.success("post a comment success");

        onSuccess(comment!);
      } catch (e) {
        console.error("e", e);
        toast.error("post a comment error");
      }
    },
    [onSuccess]
  );

  return (
    <Card className="relative">
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="content"
          control={control}
          rules={{
            required: "Please enter content",
          }}
          render={({ field, fieldState }) => (
            <Suspense fallback={<Spinner />}>
              <ContentEditor
                className="w-full border-1 rounded-xl"
                {...field}
                markdown={field.value}
                contentEditableClassName="min-h-44"
              />
              {fieldState.error?.message && (
                <p className="mt-2 text-sm text-red-500">
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
