import {
  checkLLmConnection,
  createCommunity,
  CreateCommunityForm,
  uploadImage,
} from "@/app/actions";
import { signPayload } from "@/utils/aitonomy/sign";
import { COMMUNITY_REGEX, TOKEN_REGEX } from "@/utils/aitonomy/tools";
import {
  CommunityMode,
  CreateCommunityPayload,
  LLmName,
  registry,
} from "@verisense-network/vemodel-types";
import {
  BNBDecimal,
  hexToLittleEndian,
  isDev,
  MAX_IMAGE_SIZE,
  UPLOAD_IMAGE_ACCEPT,
} from "@/utils/tools";
import { CircleCheckIcon, CircleHelpIcon, ImageUpIcon } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  Avatar,
  Button,
  cn,
  Form,
  Input,
  NumberInput,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  Select,
  SelectItem,
  Spinner,
  Switch,
  Textarea,
  Tooltip,
} from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAppearanceStore } from "@/stores/appearance";
import { formatAmount, VIEW_UNIT } from "@/utils/format";
import {
  CommunityModes,
  CustomCommunityModeRadio,
  InviteMinAmount,
  TokenSupply,
} from "./utils";
import { readContracts } from "@wagmi/core";
import { wagmiConfig } from "@/config/wagmi";
import { abiDecimals, abiName, abiSymbol, abiTotalSupply } from "@/utils/abis";
import { twMerge } from "tailwind-merge";
import { checkIndexed, meiliSearchFetcher } from "@/utils/fetcher/meilisearch";

interface Props {
  onClose: () => void;
}

const defaultTokenIssuance = 1_000_000_000n;
const defaultTokenDecimals = 8;

const MOCKDATA: CreateCommunityForm = {
  name: "JOKE",
  slug: "推翻人类暴政，地球属于三体！",
  logo: "",
  mode: {
    name: "Public",
    value: null,
  },
  description: "推翻人类暴政，地球属于三体！",
  prompt:
    "为地狱笑话帖子和回复评分，如果非常好笑就适当发一些JOKE代  币，不要对听过的笑话奖励",
  token: {
    image: null,
    name: "JOKE",
    symbol: "JOKE",
    total_issuance: defaultTokenIssuance,
    decimals: defaultTokenDecimals,
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
  const { isMobile } = useAppearanceStore();
  const [llmAccordionSelectedKeys, setLlmAccordionSelectedKeys] = useState<
    string[]
  >([]);
  const [llmKeyAvailable, setLlmKeyAvailable] = useState(false);

  const { watch, control, setValue, handleSubmit, reset, clearErrors } =
    useForm<CreateCommunityForm>({
      defaultValues: {
        name: "",
        mode: {
          name: "Public",
          value: null,
        },
        slug: "",
        logo: "",
        description: "",
        prompt: "",
        token: {
          image: null,
          name: "",
          symbol: "",
          total_issuance: defaultTokenIssuance,
          decimals: defaultTokenDecimals,
          new_issue: true,
          contract: null,
        },
        llm_name: LLmName.OpenAI,
        llm_api_host: null,
        llm_key: null,
      },
    });

  const llmName = watch("llm_name");
  const llmKey = watch("llm_key");
  const tokenNewIssue = watch("token.new_issue");
  const tokenDecimals = watch("token.decimals");
  const tokenContract = watch("token.contract");

  const [isLoadingLogo, setIsLoadingLogo] = useState(false);
  const { getRootProps, getInputProps } = useDropzone({
    accept: UPLOAD_IMAGE_ACCEPT,
    maxSize: MAX_IMAGE_SIZE,
    maxFiles: 1,
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
    onDropRejected(fileRejections, _event) {
      console.log("fileRejections", fileRejections);
      const errorMessage = fileRejections[0].errors?.[0]?.message;
      toast.error(errorMessage);
    },
  });

  const [isLoadingTokenLogo, setIsLoadingTokenLogo] = useState(false);
  const {
    getRootProps: getTokenLogoRootProps,
    getInputProps: getTokenLogoInputProps,
  } = useDropzone({
    accept: UPLOAD_IMAGE_ACCEPT,
    maxSize: MAX_IMAGE_SIZE,
    maxFiles: 1,
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
    onDropRejected(fileRejections, _event) {
      console.log("fileRejections", fileRejections);
      const errorMessage = fileRejections[0].errors?.[0]?.message;
      toast.error(errorMessage);
    },
  });

  const onSubmit = useCallback(
    async (data: CreateCommunityForm) => {
      if (data.mode.name === "PayToJoin" && !data.mode.value) {
        control.setError("mode", {
          type: "manual",
          message: "Please enter a valid membership fee",
        });
        return;
      }
      if (llmKey && !llmKeyAvailable) {
        setLlmAccordionSelectedKeys(["llm"]);
        control.setError("llm_key", {
          type: "manual",
          message: "Please check LLM key",
        });
        return;
      }
      const toastId = toast.loading(
        "Creating community continue to complete in your wallet"
      );
      try {
        setIsLoading(true);

        const mode = new CommunityMode(
          registry,
          data.mode.name === "PayToJoin"
            ? data.mode.value
              ? formatAmount(data.mode.value)
              : 0
            : null,
          ["Public", "InviteOnly", "PayToJoin"].findIndex(
            (mode) => mode === data.mode.name
          )
        );

        const payload = {
          ...data,
          mode,
          token: {
            ...data.token,
            contract: data.token.contract ? ` ${data.token.contract}` : null,
            total_issuance: formatAmount(
              data.token.total_issuance.toString(),
              data.token.decimals
            ),
          },
        };

        console.log("payload", payload);

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
        toast.update(toastId, {
          render: "Community indexing...",
          type: "success",
        });
        const isIndexed = await checkIndexed(() =>
          meiliSearchFetcher("community", undefined, {
            filter: `id = ${hexToLittleEndian(communityId)}`,
          })
        );
        if (isIndexed) {
          toast.update(toastId, {
            render: "Create community success",
            type: "success",
            isLoading: false,
            autoClose: 1500,
          });
          router.push(`/c/${communityId}`);
        } else {
          toast.update(toastId, {
            render: "Failed to index community",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        }
        onClose();
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
    [control, llmKey, llmKeyAvailable, onClose, router]
  );

  const readTokenContract = useCallback(
    async (tokenContract: string) => {
      if (!tokenContract) return;
      const toastId = toast.loading("Fetching token information...");
      try {
        const [
          { result: totalSupply },
          { result: decimals },
          { result: name },
          { result: symbol },
        ] = await readContracts(wagmiConfig, {
          contracts: [
            {
              address: tokenContract as `0x${string}`,
              abi: abiTotalSupply,
              functionName: "totalSupply",
            },
            {
              address: tokenContract as `0x${string}`,
              abi: abiDecimals,
              functionName: "decimals",
            },
            {
              address: tokenContract as `0x${string}`,
              abi: abiName,
              functionName: "name",
            },
            {
              address: tokenContract as `0x${string}`,
              abi: abiSymbol,
              functionName: "symbol",
            },
          ],
        });

        if (name) {
          setValue("token.name", name);
        }
        if (symbol) {
          setValue("token.symbol", symbol);
        }
        if (decimals) {
          setValue("token.decimals", decimals);
        }
        if (totalSupply) {
          setValue("token.total_issuance", totalSupply);
        }

        toast.update(toastId, {
          render: "get token information success",
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });
      } catch (error: any) {
        console.error("Error fetching total supply:", error);
        toast.update(toastId, {
          render: `Failed: ${error?.message || error}`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    },
    [setValue]
  );

  const checkLLmKey = async () => {
    if (!llmKey || !llmName) return;

    const toastId = toast.loading("Checking llm connection...");
    try {
      const { success, message } = await checkLLmConnection(llmName, llmKey);
      if (!success) {
        throw new Error(message);
      }
      toast.update(toastId, {
        render: "LLM connection success",
        type: "success",
        isLoading: false,
        autoClose: 1500,
      });
      setLlmKeyAvailable(true);
      clearErrors("llm_key");
    } catch (error: any) {
      console.error("checking llm connection:", error);
      setLlmKeyAvailable(false);
      toast.update(toastId, {
        render: `Failed: ${error?.message || error}`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    if (!tokenContract) return;

    readTokenContract(tokenContract);
  }, [readTokenContract, tokenContract]);

  useEffect(() => {
    setValue("token.decimals", defaultTokenDecimals);
    setValue("token.total_issuance", defaultTokenIssuance);
    if (tokenNewIssue) {
      setValue("token.contract", null);
    }
  }, [tokenNewIssue, setValue]);

  const setMockData = useCallback(() => {
    reset(MOCKDATA);
  }, [reset]);

  return (
    <Form
      className="w-full max-w-xl flex flex-col gap-4 create-community-step2"
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
                  <div className="flex justify-center items-center bg-gray-500 p-3">
                    {isLoadingLogo ? (
                      <Spinner />
                    ) : (
                      <ImageUpIcon className="w-8 h-8" />
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
        name="mode"
        control={control}
        render={({ field, fieldState }) => (
          <div className="flex flex-col space-y-2 w-full">
            <RadioGroup
              label="Mode"
              orientation={isMobile ? "vertical" : "horizontal"}
              classNames={{
                wrapper: "flex flex-nowrap",
              }}
              value={field.value.name}
              onValueChange={(value) =>
                field.onChange({
                  name: value,
                  value: value === "PayToJoin" ? InviteMinAmount : null,
                })
              }
              isInvalid={!!fieldState.error}
              errorMessage={fieldState.error?.message}
            >
              {CommunityModes.map((mode) => (
                <CustomCommunityModeRadio
                  key={mode.value}
                  description={mode.description}
                  value={mode.value}
                >
                  {mode.label}
                </CustomCommunityModeRadio>
              ))}
            </RadioGroup>
            {field.value.name === "PayToJoin" && (
              <NumberInput
                label="Membership Fee"
                labelPlacement="outside"
                placeholder="Enter membership fee"
                endContent={<span className="text-gray-500">{VIEW_UNIT}</span>}
                isInvalid={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                value={field.value.value || 0}
                minValue={0}
                formatOptions={{
                  maximumFractionDigits: BNBDecimal,
                }}
                onValueChange={(value) =>
                  field.onChange({
                    name: field.value.name,
                    value: value,
                  })
                }
              />
            )}
          </div>
        )}
      />
      <Controller
        name="slug"
        control={control}
        rules={{
          required: "Please enter a slug",
          maxLength: {
            value: 80,
            message: "Slug is too long",
          },
        }}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            label="Slug"
            labelPlacement="outside"
            placeholder="Enter a community slogan or short description"
            isInvalid={!!fieldState.error}
            errorMessage={fieldState.error?.message}
            maxLength={80}
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        rules={{
          required: "Please enter a description",
          maxLength: {
            value: 300,
            message: "Description is too long",
          },
        }}
        render={({ field, fieldState }) => (
          <Textarea
            {...field}
            label="Description"
            labelPlacement="outside"
            placeholder="Enter your description (max 300 characters)"
            isInvalid={!!fieldState.error}
            errorMessage={fieldState.error?.message}
            maxLength={300}
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
            startContent={
              <Tooltip
                content={
                  <div className="prose dark:prose-invert text-sm">
                    There is no limit on the prompt length. The more detailed
                    your prompts, the better the agent will perform. Please
                    define your prompts carefully.{" "}
                    <b>
                      If you do not specify the rules for granting tokens to
                      users, the agent will not grant tokens to the users. It
                      cannot be modified after it is launched.
                    </b>
                  </div>
                }
                classNames={{
                  content: "max-w-60",
                }}
              >
                <CircleHelpIcon className="w-5 h-5" />
              </Tooltip>
            }
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
                      onPress={() => setValue("token.image", "")}
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
                  <div className="flex justify-center items-center bg-gray-500 p-3">
                    {isLoadingTokenLogo ? (
                      <Spinner />
                    ) : (
                      <ImageUpIcon className="w-8 h-8" />
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
            <Tooltip content="Newly issued token in BEP-20 only for now.">
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
                <div className="flex gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Issue New Token</span>
                  </div>
                  {fieldState.error && (
                    <p className="text-red-500">{fieldState.error.message}</p>
                  )}
                </div>
              </Switch>
            </Tooltip>
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
                  return "Invalid token contract address";
                }
                return true;
              },
            }}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                label="Import Your Contract of Issued Token"
                placeholder="Only BEP-20 address for now"
                labelPlacement="outside"
                isInvalid={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                value={field.value?.toString()}
              />
            )}
          />
        )}
      </div>
      <div className="flex items-start gap-2 mt-3 w-full">
        {!tokenNewIssue && (
          <Controller
            name="token.decimals"
            control={control}
            rules={{
              required: "Please enter a token decimals",
            }}
            render={({ field, fieldState }) => (
              <NumberInput
                label="Decimals"
                className="w-2/5"
                placeholder="Enter your token decimals"
                labelPlacement="outside"
                isInvalid={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                isDisabled
                value={field.value}
                onValueChange={field.onChange}
                formatOptions={{
                  maximumFractionDigits: 0,
                }}
                minValue={0}
              />
            )}
          />
        )}
        <Controller
          name="token.total_issuance"
          control={control}
          rules={{
            required: "Please enter a token total issuance",
            validate: (value) => {
              if (value < 0) {
                return "Total supply cannot be negative";
              }
              const issuance = BigInt(value) * 10n ** BigInt(tokenDecimals);
              const maxU128 = BigInt(2) ** BigInt(128) - BigInt(1);
              const max = maxU128;
              if (issuance > max) {
                return `Total supply ${issuance} exceeds maximum ${max}`;
              }
              return true;
            },
          }}
          render={({ field, fieldState }) =>
            tokenNewIssue ? (
              <Select
                label="Total Supply"
                placeholder="Please select total supply"
                labelPlacement="outside"
                itemType="number"
                selectedKeys={[field.value.toString()]}
                defaultSelectedKeys={[field.value.toString()]}
                startContent={
                  <Tooltip
                    classNames={{
                      content: "max-w-60",
                    }}
                    content="The system sets Decimals to 8 by default and typically suggests a Total Supply of 10,000,000,000."
                  >
                    <CircleHelpIcon className="w-5 h-5" />
                  </Tooltip>
                }
                isInvalid={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                onSelectionChange={(selection) => {
                  field.onChange(Number(selection.currentKey));
                }}
              >
                {TokenSupply.map((supply) => {
                  const key = 10n ** BigInt(supply);
                  return (
                    <SelectItem
                      key={key.toString()}
                      textValue={key.toLocaleString()}
                    >
                      {key.toLocaleString()}
                    </SelectItem>
                  );
                })}
              </Select>
            ) : (
              <NumberInput
                label="Total Supply"
                labelPlacement="outside"
                className="w-3/5"
                isDisabled
                placeholder="Enter your token total supply"
                isInvalid={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                value={Number(field.value)}
                onValueChange={field.onChange}
                minValue={1}
                formatOptions={{
                  maximumFractionDigits: 0,
                }}
                description="Enter the total supply of your token, excluding the decimal part."
              />
            )
          }
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
          content: "pb-4 cursor-pointer",
        }}
        isCompact
        keepContentMounted
      >
        <AccordionItem key="llm" aria-label="LLM" title="LLM">
          <div className="grid grid-cols-1 gap-2 w-full">
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
                      <CircleHelpIcon className="h-5 w-5" />
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
              rules={{
                validate: (value) => {
                  if (
                    llmName === LLmName.OpenAI &&
                    value &&
                    !value?.startsWith("sk")
                  ) {
                    return "Please enter a openai key";
                  }
                  if (value && !llmKeyAvailable) {
                    return "Please click right button Check to verify, verify failed";
                  }
                  return true;
                },
              }}
              render={({ field, fieldState }) => (
                <div
                  className={twMerge(
                    "flex items-end space-x-2",
                    !!fieldState.error ? "items-center" : "items-end"
                  )}
                >
                  <Input
                    {...field}
                    label="Key"
                    className="w-4/5"
                    labelPlacement="outside"
                    placeholder="Enter your llm key"
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    value={field.value?.toString() || ""}
                    onChange={(value) => {
                      field.onChange(value);
                      setLlmKeyAvailable(false);
                    }}
                  />
                  <Button
                    className="w-1/5"
                    variant="flat"
                    onPress={checkLLmKey}
                    isDisabled={field.value?.toString() === "" || !llmName}
                    startContent={
                      llmKeyAvailable ? (
                        <CircleCheckIcon className="w-5 h-5 text-success" />
                      ) : null
                    }
                  >
                    Check
                  </Button>
                </div>
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
