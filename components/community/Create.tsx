import { createCommunity } from "@/app/actions";
import { CreateCommunityArg } from "@/utils/aitonomy";
import { COMMUNITY_REGEX } from "@/utils/aitonomy/tools";
import { Button, Form, Input, Textarea } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";

interface Props {
  onClose: () => void;
}

export default function CommunityCreate({ onClose }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCommunityArg>({
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
      description: "",
      prompt: "",
      token: {
        symbol: "",
        total_issuance: undefined,
        decimals: 2,
      },
    },
  });

  console.log("errors", errors);

  const onSubmit = useCallback(async (data: CreateCommunityArg) => {
    try {
      console.log("data", data);

      const res = await createCommunity(data);
      if (!res) return;
      onClose();
      addToast({
        title: "create community success",
        description: `community id ${res}`,
        severity: "success",
      });
    } catch (e) {
      console.error("e", e);
      addToast({
        title: "create community error",
        description: `${e}`,
        severity: "danger",
      });
    }
  }, [onClose])

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
          }
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
        rules={{
        }}
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
      <p className="text-sm text-gray-500">Token</p>
      <div className="flex grid grid-cols-2 gap-2">
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
            }
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
              value={field.value?.toString()}
              isInvalid={!!fieldState.error}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
      </div>
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
