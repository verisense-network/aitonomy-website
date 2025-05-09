"use client";

import { createThread, CreateThreadForm } from "@/app/actions";
import { useMeilisearch } from "@/hooks/useMeilisearch";
import { CreateThreadArg } from "@/utils/aitonomy";
import { signPayload } from "@/utils/aitonomy/sign";
import { COMMUNITY_REGEX } from "@/utils/aitonomy/tools";
import { PostThreadPayload } from "@verisense-network/vemodel-types";
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
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
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
import { updateLastPostAt } from "@/utils/user";
import LockNotAllowedToPost from "../lock/LockNotAllowedToPost";
import useCanPost from "@/hooks/useCanPost";
import { MentionProvider } from "../markdown/mentionCtx";
import { Mention } from "../markdown/AddMention";
import { checkIndexed, meiliSearchFetcher } from "@/utils/fetcher/meilisearch";

const MarkdownEditor = dynamic(() => import("../markdown/MarkdownEditor"), {
  ssr: false,
});

interface Props {
  community?: any;
  onClose?: () => void;
  onSuccess?: (id: string) => void;
}

export default function ThreadCreate({ community, onClose, onSuccess }: Props) {
  const router = useRouter();
  const { lastPostAt } = useUserStore();
  // accounts for mention
  const [accounts, setAccounts] = useState<Mention[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { control, watch, handleSubmit } = useForm<CreateThreadForm>({
    defaultValues: {
      community: community?.name || "",
      title: "",
      content: "",
      images: [],
      mention: [],
    },
  });

  const [searchCommunity, setSearchCommunity] = useState(community?.name || "");

  const { data: communitiesData, isLoading: isLoadingCommunities } =
    useMeilisearch("community", searchCommunity, {
      limit: 10,
    });

  const communities = useMemo(
    () => communitiesData?.hits ?? [],
    [communitiesData]
  );

  const [selectedCommunity, setSelectedCommunity] = useState(community);
  const communityName = watch("community");

  useEffect(() => {
    if (communityName) {
      setSelectedCommunity(communities?.find((c) => c.name === communityName));
    }
  }, [communityName, communities]);

  const canPost = useCanPost(selectedCommunity);

  const onSubmit = useCallback(
    async (data: CreateThreadForm) => {
      console.log("data", data);
      const toastId = toast.loading(
        "Posting continue to complete in your wallet"
      );
      try {
        setIsLoading(true);
        const title = data.title.trim();
        const images = extractMarkdownImages(data.content);
        const content = compressString(data.content.trim());
        const mention = extractMentions(data.content);
        const payload = {
          ...data,
          title,
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
        if (!success) {
          throw new Error(errorMessage);
        }
        if (!contentId) return;
        toast.update(toastId, {
          render: "Thread indexing...",
          type: "success",
        });

        const isIndexed = await checkIndexed(() =>
          meiliSearchFetcher("thread", undefined, {
            filter: `id = ${hexToLittleEndian(contentId)}`,
          })
        );
        if (isIndexed) {
          const { community, thread } = decodeId(hexToLittleEndian(contentId));
          toast.update(toastId, {
            render: "Post a thread success",
            type: "success",
            isLoading: false,
            autoClose: 1500,
          });
          router.push(`/c/${community}/${thread}`);
        } else {
          toast.update(toastId, {
            render: "Failed to index thread",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        }
        updateLastPostAt(true);
        onClose?.();
        onSuccess?.(contentId);
        setIsLoading(false);
      } catch (e: any) {
        console.error("e", e);
        toast.update(toastId, {
          render: `failed: ${e?.message || e?.toString()}`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        setIsLoading(false);
      }
    },
    [onClose, onSuccess, router]
  );

  useEffect(() => {
    updateLastPostAt();
    setAccounts([
      {
        name: "Agent",
        address: selectedCommunity?.agent_pubkey,
      },
    ]);
  }, [selectedCommunity]);

  return (
    <Form
      className="w-full flex flex-col gap-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold">Post a thread</span>
      </div>
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
            defaultInputValue={community?.name}
            isLoading={isLoadingCommunities}
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
              <MentionProvider
                value={{
                  accounts,
                  setAccounts,
                }}
              >
                {canPost ? (
                  <LockCountdown countdownTime={lastPostAt || 0} />
                ) : (
                  <LockNotAllowedToPost community={selectedCommunity} />
                )}
                <MarkdownEditor
                  className="mt-2 w-full rounded-xl border-1 border-zinc-800"
                  {...field}
                  markdown={field.value}
                  contentEditableClassName="min-h-72 max-h-[70vh] !pb-10"
                />
                {fieldState.error?.message && (
                  <p className="mt-2 text-sm text-red-500">
                    {fieldState.error.message}
                  </p>
                )}
              </MentionProvider>
            </Suspense>
          </div>
        )}
      />
      <div className="flex gap-2">
        <Button color="primary" type="submit" isLoading={isLoading}>
          Submit
        </Button>
        <Button type="reset" variant="flat">
          Reset
        </Button>
      </div>
    </Form>
  );
}
