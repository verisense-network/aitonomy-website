import { createCommunity, uploadImage } from "@/app/actions";
import { CreateCommunityArg } from "@/utils/aitonomy";
import { signPayload } from "@/utils/aitonomy/sign";
import { COMMUNITY_REGEX, TOKEN_REGEX } from "@/utils/aitonomy/tools";
import {
  CreateCommunityPayload,
  LLmName,
} from "@verisense-network/vemodel-types";
import { isDev } from "@/utils/tools";
import { CircleHelpIcon, ImageIcon, ShieldCheckIcon } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  Avatar,
  Button,
  cn,
  Form,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
  Spinner,
  Switch,
  Textarea,
  Tooltip,
} from "@heroui/react";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface Props {
  onClose: () => void;
}

const MOCKDATA: CreateCommunityArg = {
  name: "JOKE",
  slug: "推翻人类暴政，地球属于三体！",
  logo: "",
  private: false,
  description: "推翻人类暴政，地球属于三体！",
  prompt:
    "为地狱笑话帖子和回复评分，如果非常好笑就适当发一些JOKE代  币，不要对听过的笑话奖励",
  token: {
    image: null,
    name: "JOKE",
    symbol: "JOKE",
    total_issuance: 10_000_000_000,
    decimals: 2,
    new_issue: true,
    contract: null,
  },
  llm_name: LLmName.OpenAI,
  llm_api_host: null,
  llm_key: null,
};

export default function CommunityCreate({ onClose }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [llmAccordionSelectedKeys, setLlmAccordionSelectedKeys] = useState<
    string[]
  >([]);

  const { watch, control, setValue, handleSubmit, reset } =
    useForm<CreateCommunityArg>({
      defaultValues: {
        name: "",
        private: false,
        slug: "",
        logo: "",
        description: "",
        prompt: "",
        token: {
          image: null,
          name: "",
          symbol: "",
          total_issuance: 10_000_000_000,
          decimals: 2,
          new_issue: true,
          contract: null,
        },
        llm_name: LLmName.OpenAI,
        llm_api_host: null,
        llm_key: null,
      },
    });

  const llmName = watch("llm_name");
  const tokenNewIssue = watch("token.new_issue");

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
        const { success, data: imageUrl, message } = await uploadImage(image);
        if (!success) {
          throw new Error(`failed: ${message}`);
        }
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
        const { success, data: imageUrl, message } = await uploadImage(image);
        if (!success) {
          throw new Error(`failed: ${message}`);
        }
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

        const payload = {
          ...data,
          token: {
            ...data.token,
            contract: data.token.contract ? ` ${data.token.contract}` : null,
          },
        };

        const signature = await signPayload(payload, CreateCommunityPayload);

        const {
          success,
          data: communityId,
          message,
        } = await createCommunity(payload, signature);
        if (!success) {
          if (message?.includes("LLM key not found")) {
            setLlmAccordionSelectedKeys(["llm"]);
            control.setError("llm_key", {
              type: "manual",
              message: "LLM key is required",
            });
          }
          throw new Error(message);
        }
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
    [control, onClose, router]
  );

  const setMockData = useCallback(() => {
    reset(MOCKDATA);
  }, [reset]);

  return (
    <Form
      className="w-full max-w-xl flex flex-col gap-4"
      onReset={() => reset({})}
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
                      <ImageIcon className="w-8 h-8" />
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
        name="private"
        control={control}
        render={({ field, fieldState }) => (
          <Switch
            classNames={{
              base: cn(
                "inline-flex flex-row-reverse w-full max-w-full bg-content2 hover:bg-content3 items-center",
                "justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
                "data-[selected=true]:border-primary"
              ),
              wrapper: "p-0 h-4 overflow-visible",
              thumb: cn(
                "w-6 h-6 border-2 shadow-lg",
                "group-data-[hover=true]:border-primary",
                //selected
                "group-data-[selected=true]:ms-6",
                //pressed
                "group-data-[pressed=true]:w-7",
                "group-data-[selected]:group-data-[pressed]:ms-4"
              ),
            }}
            onChange={field.onChange}
            checked={field.value}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="w-5 h-5" />
                <span className="text-medium">Private Community</span>
              </div>
              <p className="text-tiny text-default-400">
                Only members can join this community.
              </p>
              {fieldState.error && (
                <p className="text-red-500">{fieldState.error.message}</p>
              )}
            </div>
          </Switch>
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
                      <ImageIcon className="w-8 h-8" />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        />
        <Controller
          name="token.name"
          control={control}
          rules={{
            required: "Please enter a token name",
            validate: (value) => {
              if (!TOKEN_REGEX.test(value)) {
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
          name="token.symbol"
          control={control}
          rules={{
            required: "Please enter a token symbol",
            validate: (value) => {
              if (!TOKEN_REGEX.test(value)) {
                return "Invalid token symbol";
              }
              return true;
            },
          }}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              label="Symbol"
              placeholder="Enter your token symbol"
              labelPlacement="outside"
              isInvalid={!!fieldState.error}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
      </div>
      <div className="flex gap-2 mt-3 w-full">
        <Controller
          name="token.new_issue"
          control={control}
          render={({ field, fieldState }) => (
            <Switch
              classNames={{
                base: cn(
                  "inline-flex flex-row-reverse w-1/3 max-w-full bg-content2 hover:bg-content3 items-center",
                  "justify-between cursor-pointer rounded-lg gap-2 p-2 border-2 border-transparent",
                  "data-[selected=true]:border-zinc-700 data-[selected=true]:w-full data-[selected=true]:p-4"
                ),
                wrapper: "p-0 h-4 overflow-visible",
                thumb: cn(
                  "w-6 h-6 border-2 shadow-lg",
                  "group-data-[hover=true]:border-primary",
                  //selected
                  "group-data-[selected=true]:ms-6",
                  //pressed
                  "group-data-[pressed=true]:w-7",
                  "group-data-[selected]:group-data-[pressed]:ms-4"
                ),
              }}
              onChange={field.onChange}
              isSelected={field.value}
              defaultSelected={field.value}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">New Issue Token</span>
                </div>
                {fieldState.error && (
                  <p className="text-red-500">{fieldState.error.message}</p>
                )}
              </div>
            </Switch>
          )}
        />
        {!tokenNewIssue && (
          <Controller
            name="token.contract"
            control={control}
            rules={{
              required: "Please enter a token contract",
              validate: (value) => {
                if (!value?.startsWith("0x")) {
                  return "Invalid token contract";
                }
                return true;
              },
            }}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                label="Contract"
                placeholder="Enter your token contract"
                labelPlacement="outside"
                isInvalid={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                value={field.value?.toString()}
              />
            )}
          />
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3 w-full">
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
        selectedKeys={llmAccordionSelectedKeys}
        onSelectionChange={(keys) =>
          setLlmAccordionSelectedKeys(keys as unknown as string[])
        }
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
                      <CircleHelpIcon className="h-6 w-6" />
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
      <div className="absolute bottom-0 left-0 right-0 flex w-full gap-2 px-4 pb-1 z-20 bg-content1 md:static">
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
      <div className="h-10 md:h-0"></div>
    </Form>
  );
}
