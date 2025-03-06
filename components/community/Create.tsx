import { createCommunity, uploadImage } from "@/app/actions";
import { CreateCommunityArg } from "@/utils/aitonomy";
import { signPayload } from "@/utils/aitonomy/sign";
import { COMMUNITY_REGEX } from "@/utils/aitonomy/tools";
import { CreateCommunityPayload, LLmName } from "@/utils/aitonomy/type";
import { isDev } from "@/utils/tools";
import { PhotoIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import {
  Accordion,
  AccordionItem,
  Avatar,
  Button,
  Form,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
  Spinner,
  Textarea,
  Tooltip,
} from "@heroui/react";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { useTransitionRouter } from "next-view-transitions";

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
    total_issuance: 10_000_000_000,
    decimals: 2,
    image: null,
  },
  llm_name: LLmName.OpenAI,
  llm_api_host: null,
  llm_key: null,
};

export default function CommunityCreate({ onClose }: Props) {
  const router = useTransitionRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { watch, control, setValue, handleSubmit, reset } =
    useForm<CreateCommunityArg>({
      defaultValues: {
        name: "",
        slug: "",
        logo: "",
        description: "",
        prompt: "",
        token: {
          image: null,
          symbol: "",
          total_issuance: 10_000_000_000,
          decimals: 2,
        },
        llm_name: LLmName.OpenAI,
        llm_api_host: null,
        llm_key: null,
      },
    });

  const llmName = watch("llm_name");

  const [isLoadingLogo, setIsLoadingLogo] = useState(false);
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    async onDrop(acceptedFiles) {
      console.log("acceptedFiles", acceptedFiles);
      const image = acceptedFiles[0];
      if (!image) {
        return;
      }
      try {
        setIsLoadingLogo(true);
        const imageUrl = await uploadImage(image);
        setValue("logo", imageUrl);
        setIsLoadingLogo(false);
      } catch (err: any) {
        console.error("err", err);
        setIsLoadingLogo(false);
      }
    },
  });

  const [isLoadingTokenLogo, setIsLoadingTokenLogo] = useState(false);
  const {
    getRootProps: getTokenLogoRootProps,
    getInputProps: getTokenLogoInputProps,
  } = useDropzone({
    accept: { "image/*": [] },
    async onDrop(acceptedFiles) {
      console.log("acceptedFiles", acceptedFiles);
      const image = acceptedFiles[0];
      if (!image) {
        return;
      }
      try {
        setIsLoadingTokenLogo(true);
        const imageUrl = await uploadImage(image);
        setValue("token.image", imageUrl);
        setIsLoadingTokenLogo(false);
      } catch (err: any) {
        console.error("err", err);
        setIsLoadingTokenLogo(false);
      }
    },
  });

  const onSubmit = useCallback(
    async (data: CreateCommunityArg) => {
      const toastId = toast.loading(
        "Creating community continue to complete in your wallet"
      );
      try {
        setIsLoading(true);
        console.log("data", data);

        const signature = await signPayload(data, CreateCommunityPayload);

        console.log("signature", signature);
        const communityId = await createCommunity(data, signature);
        console.log("communityId", communityId);
        if (!communityId) return;
        onClose();
        toast.update(toastId, {
          render: "Success, redirecting...",
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });
        setTimeout(() => {
          router.push(`/c/${communityId}`);
        }, 1500);
      } catch (e: any) {
        console.error("e", e);
        toast.update(toastId, {
          render: `Failed: ${e?.message || e}`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
      setIsLoading(false);
    },
    [onClose, router]
  );

  const setMockData = useCallback(() => {
    reset(MOCKDATA);
  }, [reset]);

  return (
    <Form
      className="w-full max-w-xl flex flex-col gap-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex items-center space-x-4 w-full">
        <Controller
          name="logo"
          control={control}
          rules={{}}
          render={({ field }) => (
            <div className="flex justify-center items-center m-2 w-14 h-14 aspect-square">
              {field.value ? (
                <Popover placement="bottom">
                  <PopoverTrigger>
                    <Avatar
                      src={field.value}
                      className="w-full h-full"
                      imgProps={{
                        style: {
                          objectFit: "contain",
                        },
                      }}
                    />
                  </PopoverTrigger>
                  <PopoverContent>
                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => setValue("logo", "")}
                    >
                      Remove logo
                    </Button>
                  </PopoverContent>
                </Popover>
              ) : (
                <div
                  {...getRootProps()}
                  className="flex justify-center items-center rounded-full overflow-hidden cursor-pointer"
                >
                  <input {...getInputProps()} />
                  <div className="flex justify-center items-center bg-gray-300 p-3">
                    {isLoadingLogo ? (
                      <Spinner />
                    ) : (
                      <PhotoIcon className="w-8 h-8" />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        />
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
      </div>
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
          maxLength: {
            value: 60,
            message: "Description is too long",
          },
        }}
        render={({ field, fieldState }) => (
          <Textarea
            {...field}
            label="Description"
            labelPlacement="outside"
            placeholder="Enter your description"
            isInvalid={!!fieldState.error}
            errorMessage={fieldState.error?.message}
            maxLength={60}
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
      <div>
        <h1 className="text-md py-2">Token</h1>
      </div>
      <div className="flex items-center space-x-4 w-full">
        <Controller
          name="token.image"
          control={control}
          rules={{}}
          render={({ field }) => (
            <div className="flex justify-center items-center m-2 w-14 h-14 aspect-square">
              {field.value ? (
                <Popover placement="bottom">
                  <PopoverTrigger>
                    <Avatar
                      src={field.value}
                      className="w-full h-full"
                      imgProps={{
                        style: {
                          objectFit: "contain",
                        },
                      }}
                    />
                  </PopoverTrigger>
                  <PopoverContent>
                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => setValue("logo", "")}
                    >
                      Remove logo
                    </Button>
                  </PopoverContent>
                </Popover>
              ) : (
                <div
                  {...getTokenLogoRootProps()}
                  className="flex justify-center items-center rounded-full overflow-hidden cursor-pointer"
                >
                  <input {...getTokenLogoInputProps()} />
                  <div className="flex justify-center items-center bg-gray-300 p-3">
                    {isLoadingTokenLogo ? (
                      <Spinner />
                    ) : (
                      <PhotoIcon className="w-8 h-8" />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        />
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
      </div>
      <div className="flex grid grid-cols-2 gap-2 mt-3 w-full">
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
      <Accordion
        selectionMode="multiple"
        variant="light"
        itemClasses={{
          content: "pb-4",
        }}
        isCompact
        keepContentMounted
      >
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
                  selectedKeys={[field.value]}
                  endContent={
                    <Tooltip content="currently only supports OpenAI">
                      <QuestionMarkCircleIcon className="h-6 w-6" />
                    </Tooltip>
                  }
                  disabledKeys={[LLmName.DeepSeek]}
                >
                  {Object.values(LLmName).map((llm) => (
                    <SelectItem key={llm}>{llm}</SelectItem>
                  ))}
                </Select>
              )}
            />
            {llmName !== LLmName.OpenAI && (
              <Controller
                name="llm_api_host"
                control={control}
                rules={{
                  required: "Please enter an llm api host",
                }}
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
            )}
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
