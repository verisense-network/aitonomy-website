import { setAlias } from "@/app/actions";
import { SetAliasArg } from "@/utils/aitonomy";
import { signPayload } from "@/utils/aitonomy/sign";
import { NAME_REGEX } from "@/utils/aitonomy/tools";
import { SetAliasPayload } from "@/utils/aitonomy/type";
import { addToast, Button, Form, Input } from "@heroui/react";
import { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";

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
      // console.log("signature", signature);
      const res = await setAlias(payload, signature);
      if (res === null) {
        onSuccess();
      } else {
        console.error(res);
        addToast({
          title: "set alias name error",
          description: `error: ${res}`,
          severity: "danger",
        });
      }
    },
    [onSuccess]
  );

  return (
    <div>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex space-x-2">
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
          <Button type="submit" size="md">
            Submit
          </Button>
          <Button size="md" onPress={onClose}>
            Close
          </Button>
        </div>
      </Form>
    </div>
  );
}
