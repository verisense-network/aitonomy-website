import { setMode, SetModeForm } from "@/app/actions";
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  NumberInput,
  RadioGroup,
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
  SetModePayload,
} from "@verisense-network/vemodel-types";
import { formatAmount, VIEW_UNIT } from "@/utils/format";
import { useAppearanceStore } from "@/stores/appearance";
import { Id, toast } from "react-toastify";
import { signPayload } from "@/utils/aitonomy/sign";
import { ethers } from "ethers";
import { BNBDecimal } from "@/utils/tools";

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

  const { control, handleSubmit } = useForm<SetModeForm>({
    defaultValues: {
      community: currentCommunity.name,
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

  const onSubmit = useCallback(
    async (data: SetModeForm) => {
      if (data.mode.name === "PayToJoin" && !data.mode.value) {
        toast.error("Please enter a valid membership fee");
        return;
      }
      const toastId = toast.loading("Setting community mode");
      try {
        const payload = {
          community: data.community,
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
        const signature = await signPayload(payload, SetModePayload);
        const { success, message } = await setMode(payload, signature);

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
        console.error("setting mode error", e);
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
          <ModalHeader>Community Settings</ModalHeader>
          <ModalBody>
            <Form onSubmit={handleSubmit(onSubmit)}>
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
