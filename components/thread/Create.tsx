import { createThread } from "@/app/actions";
import { CreateThreadArg } from "@/utils/aitonomy";
import { signPayload } from "@/utils/aitonomy/sign";
import { COMMUNITY_REGEX } from "@/utils/aitonomy/tools";
import { decodeId } from "@/utils/thread";
import { hexToLittleEndian } from "@/utils/tools";
import { Autocomplete, Button, Form, Input, Textarea } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";

interface Props {
  onClose: () => void;
}

export default function ThreadCreate({ onClose }: Props) {
  const router = useRouter();
  const { control, handleSubmit } = useForm<CreateThreadArg>({
    defaultValues: {
      community: "",
      title: "",
      content: "",
      mention: [],
    },
  });

  const onSubmit = useCallback(
    async (data: CreateThreadArg) => {
      console.log(data);
      try {
        const payload = {
          ...data,
          image: data.image === "" ? undefined : data.image,
          mention: new Array(0).fill(new Array(32).fill(0)),
        } as CreateThreadArg;

        const signature = await signPayload(payload);

        const contentId = await createThread(payload, signature);
        console.log("contentId", contentId);
        if (!contentId) return;

        const { community, thread } = decodeId(hexToLittleEndian(contentId));

        addToast({
          title: "post a thread success",
          description: `thread id ${thread}`,
          severity: "success",
        });
        setTimeout(() => {
          router.push(`/c/${community}/${thread}`);
        }, 1500);
        onClose();
      } catch (e) {
        console.error("e", e);
        addToast({
          title: "post a thread error",
          description: `${e}`,
          severity: "danger",
        });
      }
    },
    [onClose, router]
  );

  return (
    <Form
      className="w-full max-w-md flex flex-col gap-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Controller
        name="community"
        control={control}
        rules={{
          required: "Please enter a community name",
          validate: (value) => {
            if (!COMMUNITY_REGEX.test(value)) {
              return "Invalid community name";
            }
            return true;
          },
        }}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            label="Community Name"
            labelPlacement="outside"
            placeholder="Enter your community name"
            isInvalid={!!fieldState.error}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
      <Controller
        name="title"
        control={control}
        rules={{
          required: "Please enter a title",
        }}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            label="Title"
            labelPlacement="outside"
            placeholder="Enter your title"
            isInvalid={!!fieldState.error}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
      <Controller
        name="image"
        control={control}
        rules={{}}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            label="Image"
            labelPlacement="outside"
            placeholder="Enter your image"
            isInvalid={!!fieldState.error}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
      <Controller
        name="content"
        control={control}
        rules={{
          required: "Please enter content",
        }}
        render={({ field, fieldState }) => (
          <Textarea
            {...field}
            className="max-w-md"
            label="Content"
            labelPlacement="outside"
            placeholder="Please enter content"
            isInvalid={!!fieldState.error}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
      <Controller
        name="mention"
        control={control}
        render={({ field, fieldState }) => (
          <Autocomplete
            {...field}
            className="max-w-md"
            label="Mention"
            labelPlacement="outside"
            placeholder="Enter mentions"
            isInvalid={!!fieldState.error}
            errorMessage={fieldState.error?.message}
          >
            {[]}
          </Autocomplete>
        )}
      />
      <div className="flex gap-2">
        <Button color="primary" type="submit">
          Submit
        </Button>
        <Button type="reset" variant="flat">
          Reset
        </Button>
      </div>
    </Form>
  );
}
