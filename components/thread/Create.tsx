import { createThread } from "@/app/actions";
import useMeilisearch from "@/hooks/useMeilisearch";
import { CreateThreadArg } from "@/utils/aitonomy";
import { signPayload } from "@/utils/aitonomy/sign";
import { COMMUNITY_REGEX } from "@/utils/aitonomy/tools";
import { PostThreadPayload } from "@/utils/aitonomy/type";
import { decodeId } from "@/utils/thread";
import { debounce, hexToLittleEndian } from "@/utils/tools";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Form,
  Input,
  Spinner,
} from "@heroui/react";
import { useTransitionRouter } from "next-view-transitions";
import { Suspense, useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import dynamic from "next/dynamic";
import { extractMarkdownImages } from "@/utils/markdown";

const ContentEditor = dynamic(() => import("../mdxEditor/ContentEditor"), {
  ssr: false,
});

interface Props {
  defaultCommunity?: string;
  replyTo?: string;
  onClose: () => void;
}

export default function ThreadCreate({
  defaultCommunity,
  replyTo,
  onClose,
}: Props) {
  const router = useTransitionRouter();
  const { control, handleSubmit } = useForm<CreateThreadArg>({
    defaultValues: {
      community: defaultCommunity || "",
      title: "",
      content: "",
      mention: [],
    },
  });

  const searchCommunityRef = useRef(null);
  const [searchCommunity, setSearchCommunity] = useState("");

  const { data: communitiesData, isLoading } = useMeilisearch(
    "community",
    searchCommunity,
    {
      limit: 10,
    }
  );

  const communities = communitiesData?.hits ?? [];

  const onSubmit = useCallback(
    async (data: CreateThreadArg) => {
      console.log(data);
      const toastId = toast.loading(
        "Posting continue to complete in your wallet"
      );
      console.log("toastId", toastId);
      try {
        const images = extractMarkdownImages(data.content);
        const payload = {
          ...data,
          image: images.length > 0 ? images[0] : undefined,
          mention: new Array(0).fill(new Array(32).fill(0)),
        } as CreateThreadArg;

        const signature = await signPayload(payload, PostThreadPayload);

        const contentId = await createThread(payload, signature);
        console.log("contentId", contentId);
        if (!contentId) return;

        const { community, thread } = decodeId(hexToLittleEndian(contentId));

        toast.update(toastId, {
          render: "post a thread success",
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });
        setTimeout(() => {
          router.push(`/c/${community}/${thread}`);
        }, 1500);
        onClose();
      } catch (e: any) {
        console.error("e", e);
        toast.update(toastId, {
          render: `failed: ${e?.message || e?.toString()}`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    },
    [onClose, router]
  );

  return (
    <Form
      className="w-full max-w-2xl flex flex-col gap-4"
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
          <Autocomplete
            {...field}
            ref={searchCommunityRef}
            label="Community Name"
            labelPlacement="outside"
            placeholder="Enter your community name"
            isInvalid={!!fieldState.error}
            errorMessage={fieldState.error?.message}
            defaultInputValue={defaultCommunity}
            isLoading={isLoading}
            value={field.value}
            onValueChange={(value) => {
              field.onChange(value);
            }}
            onInputChange={debounce((value) => {
              if (value === field.value) return;
              setSearchCommunity(value);
            }, 500)}
            onSelectionChange={(value) => {
              field.onChange(value);
            }}
          >
            {communities.map((it) => (
              <AutocompleteItem key={it.name}>{it.name}</AutocompleteItem>
            ))}
          </Autocomplete>
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
        name="content"
        control={control}
        rules={{
          required: "Please enter content",
        }}
        render={({ field, fieldState }) => (
          <div className="w-full">
            <span className={fieldState.error ? "text-red-500" : ""}>
              Content
            </span>
            <Suspense fallback={<Spinner />}>
              <ContentEditor
                className="mt-2 w-full rounded-xl"
                {...field}
                markdown={field.value}
                contentEditableClassName="min-h-72"
              />
              {fieldState.error?.message && (
                <p className="mt-2 text-sm text-red-500">
                  {fieldState.error.message}
                </p>
              )}
            </Suspense>
          </div>
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
