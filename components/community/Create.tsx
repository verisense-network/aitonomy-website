import { createCommunity } from '@/app/actions';
import { CreateCommunityArg } from '@/utils/aitonomy';
import { Button, Form, Input, Textarea } from '@heroui/react';
import { addToast } from '@heroui/toast';
import { FormEvent, useCallback } from 'react';

interface Props {
  onClose: () => void;
}

export default function CommunityCreate({ onClose }: Props) {

  const submit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    console.log(data);
    try {
      const res = await createCommunity(data as CreateCommunityArg);
      console.log(res)
      if (!res) return;
      onClose();
      addToast({
        title: "create community success",
        description: `thread id ${res}`,
        severity: "success"
      })
    } catch (e) {
      addToast({
        title: "create community error",
        description: `${e}`,
        severity: "danger"
      })
    }
  }, [])

  return (
    <Form
      className="w-full max-w-md flex flex-col gap-4"
      validationBehavior="native"
      onSubmit={submit}
    >
      <Input
        isRequired
        errorMessage="Please enter a community name"
        label="Community Name"
        labelPlacement="outside"
        name="name"
        placeholder="Enter your community name"
        type="text"
      />
      <Input
        isRequired
        errorMessage="Please enter a slug"
        label="Slug"
        labelPlacement="outside"
        name="slug"
        placeholder="Enter your slug"
        type="text"
      />
      <Textarea
        className="max-w-md"
        isRequired
        errorMessage="Please enter a description"
        label="Description"
        labelPlacement='outside'
        placeholder="Please enter a description"
        name="description"
      />
      <Textarea
        className="max-w-md"
        isRequired
        errorMessage="Please enter a prompt"
        label="Prompt"
        labelPlacement='outside'
        placeholder="Please enter a prompt"
        name="prompt"
      />
      <div className="flex gap-2">
        <Button color="primary" type="submit">
          Submit
        </Button>
        <Button type="reset" variant="flat">
          Reset
        </Button>
      </div>
    </Form>
  )
}