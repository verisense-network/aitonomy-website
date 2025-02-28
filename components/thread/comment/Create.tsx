import { createComment, CreateCommentParams } from "@/app/actions";
import { signPayload } from "@/utils/aitonomy/sign";
import { PostCommentPayload } from "@/utils/aitonomy/type";
import { decodeId } from "@/utils/thread";
import { hexToLittleEndian } from "@/utils/tools";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { Form, Button, Card, Textarea, addToast } from "@heroui/react";
import { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";

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

        addToast({
          title: "post a comment success",
          description: `comment id ${comment}`,
          severity: "success",
        });

        onSuccess(comment!);
      } catch (e) {
        console.error("e", e);
        addToast({
          title: "post a comment error",
          description: `${e}`,
          severity: "danger",
        });
      }
    },
    [onSuccess]
  );

  return (
    <Card className="relative">
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          control={control}
          name="content"
          rules={{
            required: true,
          }}
          render={({ field, fieldState }) => (
            <Textarea
              {...field}
              classNames={{
                inputWrapper: "p-5 pb-10 bg-white",
              }}
              placeholder="Write a comment..."
              errorMessage={fieldState.error?.message}
            />
          )}
        />
        <div className="absolute bottom-2 left-5 z-50">
          <Button isIconOnly>
            <PhotoIcon width={25} height={25} />
          </Button>
        </div>
        <Button type="submit" className="absolute bottom-2 right-2 z-50">
          Submit
        </Button>
      </Form>
    </Card>
  );
}
