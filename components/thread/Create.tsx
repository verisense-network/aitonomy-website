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
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import dynamic from "next/dynamic";

const ContentEditor = dynamic(() => import("./ContentEditor"), { ssr: false });

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
  const router = useRouter();
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
      try {
        const payload = {
          ...data,
          image: data.image === "" ? undefined : data.image,
          mention: new Array(0).fill(new Array(32).fill(0)),
        } as CreateThreadArg;

        const signature = await signPayload(payload, PostThreadPayload);

        const contentId = await createThread(payload, signature);
        console.log("contentId", contentId);
        if (!contentId) return;

        const { community, thread } = decodeId(hexToLittleEndian(contentId));

        toast.success("post a thread success");
        setTimeout(() => {
          router.push(`/c/${community}/${thread}`);
        }, 1500);
        onClose();
      } catch (e) {
        console.error("e", e);
        toast.error("post a thread error");
      }
    },
    [onClose, router]
  );

  return (
    <Form
      className="w-full max-w-xl flex flex-col gap-4"
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
              content
            </span>
            <Suspense fallback={<Spinner />}>
              <ContentEditor
                className="mt-2 w-full min-h-56 border-gray-200 border-2 rounded-small"
                {...field}
                markdown={field.value}
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
