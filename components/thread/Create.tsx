import { createThread } from '@/app/actions';
import { CreateThreadArg } from '@/utils/aitonomy';
import { Autocomplete, Button, Form, Input, Textarea } from '@heroui/react';
import { addToast } from '@heroui/toast';
import { FormEvent, useCallback } from 'react';

interface Props {
  onClose: () => void;
}

export default function ThreadCreate({ onClose }: Props) {

  const submit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    console.log(data);
    try {
      const res = await createThread({
        ...data,
        image: data.image === '' ? undefined : data.image,
        mention: new Array(0).fill(new Array(32).fill(0)),
      } as CreateThreadArg);
      if (!res) return;
      addToast({
        title: "post a thread success",
        description: `thread id ${res}`,
        severity: "success"
      })
      onClose();
    } catch (e) {
      addToast({
        title: "post a thread error",
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
        name="community"
        placeholder="Enter your community name"
        type="text"
      />
      <Input
        isRequired
        errorMessage="Please enter a title"
        label="Title"
        labelPlacement="outside"
        name="title"
        placeholder="Enter your title"
        type="text"
      />
      <Input
        className="max-w-md"
        label="Image"
        labelPlacement="outside"
        name="image"
        placeholder="Enter your image"
        type="text"
      />
      <Textarea
        className="max-w-md"
        isRequired
        errorMessage="Please enter content"
        label="Content"
        labelPlacement='outside'
        placeholder="Please enter content"
        name="content"
      />
      <Autocomplete
        className="max-w-md"
        label="Mention"
        labelPlacement='outside'
        placeholder='Enter mentions'
        name="mention"
      >
        {[]}
      </Autocomplete>
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