import { createCommunity } from "@/app/actions";
import { CreateCommunityArg } from "@/utils/aitonomy";
import { signPayload } from "@/utils/aitonomy/sign";
import { COMMUNITY_REGEX } from "@/utils/aitonomy/tools";
import { CreateCommunityPayload, LLmName } from "@/utils/aitonomy/type";
import { isDev } from "@/utils/tools";
import {
  Accordion,
  AccordionItem,
  Button,
  Form,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface Props {
  onClose: () => void;
}

const MOCKDATA = {
  name: "JOKE",
  slug: "推翻人类暴政，地球属于三体！",
  logo: "",
  description: "推翻人类暴政，地球属于三体！",
  prompt:
    "为地狱笑话帖子和回复评分，如果非常好笑就适当发一些JOKE代  币，不要对听过的笑话奖励",
  token: {
    symbol: "JOKE",
    total_issuance: 10000000000,
    decimals: 2,
    image: null,
  },
  llm_name: LLmName.OpenAI,
  llm_api_host: null,
  llm_key: null,
};

export default function CommunityCreate({ onClose }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { control, handleSubmit, reset } = useForm<CreateCommunityArg>({
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
      description: "",
      prompt: "",
      token: {
        image: null,
        symbol: "",
        total_issuance: 2,
        decimals: 2,
      },
      llm_name: LLmName.OpenAI,
      llm_api_host: null,
      llm_key: null,
    },
  });

  const onSubmit = useCallback(
    async (data: CreateCommunityArg) => {
      try {
        setIsLoading(true);
        console.log("data", data);

        const signature = await signPayload(data, CreateCommunityPayload);

        console.log("signature", signature);
        const communityId = await createCommunity(data, signature);
        console.log("communityId", communityId);
        if (!communityId) return;
        onClose();
        addToast({
          title: "create community success, redirect to community page",
          description: `community id ${communityId}`,
          severity: "success",
        });
        setTimeout(() => {
          router.push(`/c/${communityId}`);
        }, 1500);
      } catch (e: any) {
        console.error("e", e);
        addToast({
          title: "create community error",
          description: `${e?.message || e}`,
          severity: "danger",
        });
      }
      setIsLoading(false);
    },
    [onClose]
  );

  const setMockData = useCallback(() => {
    reset(MOCKDATA);
  }, [reset]);

  return (
    <Form
      className="w-full max-w-md flex flex-col gap-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Controller
        name="name"
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
        name="logo"
        control={control}
        rules={{}}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            label="Logo"
            labelPlacement="outside"
            placeholder="Enter your logo"
            isInvalid={!!fieldState.error}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
      <Controller
        name="slug"
        control={control}
        rules={{
          required: "Please enter a slug",
        }}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            label="Slug"
            labelPlacement="outside"
            placeholder="Enter your slug"
            isInvalid={!!fieldState.error}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        rules={{
          required: "Please enter a description",
        }}
        render={({ field, fieldState }) => (
          <Textarea
            {...field}
            label="Description"
            labelPlacement="outside"
            placeholder="Enter your description"
            isInvalid={!!fieldState.error}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
      <Controller
        name="prompt"
        control={control}
        rules={{
          required: "Please enter a prompt",
        }}
        render={({ field, fieldState }) => (
          <Textarea
            {...field}
            label="Prompt"
            labelPlacement="outside"
            placeholder="Enter your prompt"
            isInvalid={!!fieldState.error}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
      <Accordion
        selectionMode="multiple"
        selectedKeys="all"
        hideIndicator
        keepContentMounted
      >
        <AccordionItem key="token" aria-label="Token" title="Token">
          <div className="flex grid grid-cols-2 gap-2 w-full">
            <Controller
              name="token.symbol"
              control={control}
              rules={{
                required: "Please enter a token name",
                validate: (value) => {
                  if (!COMMUNITY_REGEX.test(value)) {
                    return "Invalid token name";
                  }
                  return true;
                },
              }}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Name"
                  placeholder="Enter your token name"
                  labelPlacement="outside"
                  isInvalid={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="token.decimals"
              control={control}
              rules={{
                required: "Please enter a token decimals",
              }}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Decimals"
                  labelPlacement="outside"
                  type="number"
                  placeholder="Enter your token name"
                  isInvalid={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  value={field.value?.toString()}
                />
              )}
            />
            <Controller
              name="token.image"
              control={control}
              rules={{
                minLength: 1,
              }}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Image"
                  labelPlacement="outside"
                  placeholder="Enter your token image"
                  isInvalid={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  value={field.value?.toString() || ""}
                />
              )}
            />
            <Controller
              name="token.total_issuance"
              control={control}
              rules={{
                required: "Please enter a token total issuance",
              }}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Total Issuance"
                  labelPlacement="outside"
                  type="number"
                  placeholder="Enter your token total issuance"
                  isInvalid={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  value={field.value?.toString()}
                />
              )}
            />
          </div>
        </AccordionItem>
        <AccordionItem key="llm" aria-label="LLM" title="LLM">
          <div className="flex grid grid-cols-1 gap-2 w-full">
            <Controller
              name="llm_name"
              control={control}
              rules={{
                required: "Select an llm",
                validate: (value) => {
                  if (!COMMUNITY_REGEX.test(value)) {
                    return "Invalid llm name";
                  }
                  return true;
                },
              }}
              render={({ field, fieldState }) => (
                <Select
                  {...field}
                  label="Name"
                  labelPlacement="outside"
                  placeholder="Select an llm"
                  isInvalid={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  value={field.value}
                  defaultSelectedKeys={field.value ? ["OpenAI"] : []}
                >
                  {Object.values(LLmName).map((llm) => (
                    <SelectItem key={llm}>{llm}</SelectItem>
                  ))}
                </Select>
              )}
            />
            <Controller
              name="llm_api_host"
              control={control}
              rules={{}}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="API Host"
                  labelPlacement="outside"
                  placeholder="Enter your llm api host"
                  isInvalid={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  value={field.value?.toString()}
                />
              )}
            />
            <Controller
              name="llm_key"
              control={control}
              rules={{}}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Key"
                  labelPlacement="outside"
                  placeholder="Enter your llm key"
                  isInvalid={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  value={field.value?.toString() || ""}
                />
              )}
            />
          </div>
        </AccordionItem>
      </Accordion>
      <div className="flex gap-2">
        <Button color="primary" type="submit" isLoading={isLoading}>
          Submit
        </Button>
        <Button type="reset" variant="flat">
          Reset
        </Button>
        {isDev && (
          <Button variant="flat" onPress={setMockData}>
            Mock Data
          </Button>
        )}
      </div>
    </Form>
  );
}
