import { checkInvite, createThread, CreateThreadForm } from "@/app/actions";
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
import {
  extractMarkdownImages,
  extractMentions,
  mentionsToAccountId,
} from "@/utils/markdown";
import { compressString } from "@/utils/compressString";
import LockCountdown from "../lock/LockCountdown";
import { useUserStore } from "@/stores/user";
import { updateAccountInfo } from "@/utils/user";
import LockNotAllowedToPost from "../lock/LockNotAllowedToPost";
import useCanPost from "@/hooks/useCanPost";

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
  const router = useRouter();
  const { lastPostAt } = useUserStore();
  const { control, watch, handleSubmit } = useForm<CreateThreadForm>({
    defaultValues: {
      community: defaultCommunity || "",
      title: "",
      content: "",
      images: [],
      mention: [],
    },
  });

  const [searchCommunity, setSearchCommunity] = useState("");

  const { data: communitiesData, isLoading } = useMeilisearch(
    "community",
    searchCommunity,
    {
      limit: 10,
    }
  );

  const [communityId, setCommunityId] = useState("");
  const community = watch("community");

  useEffect(() => {
    if (community) {
      setCommunityId(
        communitiesData?.hits?.find((c) => c.name === community)?.id || ""
      );
    }
  }, [community, communitiesData]);

  const communities = communitiesData?.hits ?? [];

  const canPost = useCanPost(communityId);

  const onSubmit = useCallback(
    async (data: CreateThreadForm) => {
      console.log(data);
      const toastId = toast.loading(
        "Posting continue to complete in your wallet"
      );
      console.log("toastId", toastId);
      try {
        const images = extractMarkdownImages(data.content);
        const content = compressString(data.content);
        const mention = extractMentions(data.content);
        const payload = {
          ...data,
          content: Array.from(content),
          images,
          mention: mentionsToAccountId(mention),
        } as CreateThreadArg;

        const signature = await signPayload(payload, PostThreadPayload);

        const {
          success,
          data: contentId,
          message: errorMessage,
        } = await createThread(payload, signature);
        console.log("contentId", contentId);
        if (!success) {
          throw new Error(errorMessage);
        }
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
        updateAccountInfo();
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

  useEffect(() => {
    updateAccountInfo();
  }, []);

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
          <div className="relative w-full">
            <span className={fieldState.error ? "text-red-500" : ""}>
              Content
            </span>
            <Suspense fallback={<Spinner />}>
              {canPost ? (
                <LockCountdown countdownTime={lastPostAt || 0} />
              ) : (
                <LockNotAllowedToPost />
              )}
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
