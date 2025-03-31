import { setAlias } from "@/app/actions";
import { SetAliasArg } from "@/utils/aitonomy";
import { signPayload } from "@/utils/aitonomy/sign";
import { NAME_REGEX } from "@/utils/aitonomy/tools";
import { SetAliasPayload } from "@verisense-network/vemodel-types";
import { Button, Form, Input } from "@heroui/react";
import { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface UpdateNameProps {
  defaultName: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function UpdateAliasName({
  defaultName,
  onSuccess,
  onClose,
}: UpdateNameProps) {
  const { control, handleSubmit } = useForm<SetAliasArg>({
    defaultValues: {
      alias: defaultName,
    },
  });

  const onSubmit = useCallback(
    async (data: any) => {
      const payload = {
        alias: data.alias,
      };
      const signature = await signPayload(payload, SetAliasPayload);

      const { success, message: errorMessage } = await setAlias(
        payload,
        signature
      );
      if (!success) {
        toast.error(`Failed: ${errorMessage}`);
        return;
      }
      onSuccess();
    },
    [onSuccess]
  );

  return (
    <div>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex space-x-2 items-center">
          <Controller
            name="alias"
            control={control}
            rules={{
              required: "Name is required",
              validate: (value) => {
                if (!NAME_REGEX.test(value)) {
                  return "Invalid name";
                }
                return true;
              },
            }}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                placeholder="Please enter your name"
                isInvalid={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                defaultValue={defaultName}
              />
            )}
          />
          <div className="flex flex-col space-y-2">
            <Button type="submit" size="sm">
              Submit
            </Button>
            <Button size="sm" onPress={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
