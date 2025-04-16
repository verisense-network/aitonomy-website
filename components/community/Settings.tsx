import { setCommunity, SetCommunityForm, uploadImage } from "@/app/actions";
import {
  Avatar,
  Button,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  NumberInput,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  Spinner,
  Textarea,
} from "@heroui/react";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  CommunityModes,
  CustomCommunityModeRadio,
  getCommunityMode,
  InviteMinAmount,
} from "./utils";
import {
  CommunityMode,
  registry,
  SetCommunityPayload,
} from "@verisense-network/vemodel-types";
import { formatAmount, VIEW_UNIT } from "@/utils/format";
import { useAppearanceStore } from "@/stores/appearance";
import { Id, toast } from "react-toastify";
import { signPayload } from "@/utils/aitonomy/sign";
import { ethers } from "ethers";
import { BNBDecimal, MAX_IMAGE_SIZE, UPLOAD_IMAGE_ACCEPT } from "@/utils/tools";
import { ImageUpIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface CommunitySettingsProps {
  isOpen: boolean;
  community?: any;
  onSuccess: (toastId: Id) => void;
  onClose: () => void;
  onOpenChange: () => void;
}
export default function CommunitySettings({
  community,
  isOpen,
  onSuccess,
  onClose,
}: CommunitySettingsProps) {
  const { isMobile } = useAppearanceStore();
  const [currentCommunity, setCurrentCommunity] = useState(community);

  const communityMode = getCommunityMode(
    currentCommunity.mode
  ) as keyof CommunityMode;

  const { control, setValue, handleSubmit } = useForm<SetCommunityForm>({
    defaultValues: {
      community: currentCommunity.name,
      logo: currentCommunity.logo,
      description: currentCommunity.description,
      slug: currentCommunity.slug,
      mode: {
        name: communityMode,
        value: currentCommunity.mode?.[communityMode]
          ? Number(
              ethers.formatEther(
                currentCommunity.mode[communityMode].toString()
              )
            )
          : null,
      },
    },
  });

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

  const onSubmit = useCallback(
    async (data: SetCommunityForm) => {
      if (data.mode.name === "PayToJoin" && !data.mode.value) {
        toast.error("Please enter a valid membership fee");
        return;
      }
      const toastId = toast.loading("Setting community updating...");
      try {
        const payload = {
          ...data,
          mode: new CommunityMode(
            registry,
            data.mode.name === "PayToJoin"
              ? data.mode.value
                ? formatAmount(data.mode.value)
                : 0
              : null,
            ["Public", "InviteOnly", "PayToJoin"].findIndex(
              (mode) => mode === data.mode.name
            )
          ),
        };
        console.log("payload", payload);
        const signature = await signPayload(payload, SetCommunityPayload);
        const { success, message } = await setCommunity(payload, signature);

        if (!success) {
          toast.update(toastId, {
            render: message,
            type: "error",
            isLoading: false,
            autoClose: 2000,
          });
          return;
        }
        onSuccess(toastId);
      } catch (e: any) {
        console.error("setting community error", e);
        toast.update(toastId, {
          render: e.message,
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    },
    [onSuccess]
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        classNames={{
          body: "max-h-[85vh] overflow-y-auto md:max-h-[95vh]",
        }}
        onClose={onClose}
        size="xl"
      >
        <ModalContent>
          <ModalHeader>{currentCommunity.name} Settings</ModalHeader>
          <ModalBody>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="logo"
                control={control}
                rules={{}}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <div className="text-sm">Logo</div>
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
                  </div>
                )}
              />
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
                        endContent={
                          <span className="text-gray-500">{VIEW_UNIT}</span>
                        }
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
              <div className="flex items-center w-full mt-4 px-2">
                <Button color="primary" type="submit">
                  Submit
                </Button>
              </div>
            </Form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
