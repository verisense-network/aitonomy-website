import { PhotoIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
} from "@heroui/react";
import {
  ButtonWithTooltip,
  insertImage$,
  InsertImageParameters,
  Separator,
  SrcImageParameters,
  usePublisher,
} from "@mdxeditor/editor";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";

import Dropzone from "react-dropzone";
import { uploadImage } from "@/app/actions";
import { Controller, useForm } from "react-hook-form";

export default function AddImage() {
  const insertImage = usePublisher(insertImage$);
  const [openImageDialog, seOpenImageDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, setValue, reset } =
    useForm<InsertImageParameters>({
      defaultValues: {
        src: "",
        altText: "",
      },
    });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setLoading(true);
      const toastId = toast.loading("Uploading image");
      try {
        const image = acceptedFiles[0];
        const url = await uploadImage(image);
        setValue("src", url);
        setValue("altText", image.name);
        toast.update(toastId, {
          render: `Upload Complete`,
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });
        seOpenImageDialog(false);
        setLoading(false);
      } catch (e: any) {
        toast.update(toastId, {
          render: `failed to upload image: ${e?.message || e?.toString()}`,
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
        setLoading(false);
      }
    },
    [setValue]
  );

  const onSubmit = useCallback(
    (data: InsertImageParameters) => {
      try {
        setLoading(true);
        insertImage({
          src: (data as SrcImageParameters).src,
          altText: data.altText,
          title: data.title,
        });
        setLoading(false);
        seOpenImageDialog(false);
        reset();
      } catch {
        setLoading(false);
        toast.error("Can't Add your Image, try again.");
      }
    },
    [insertImage, reset]
  );

  return (
    <>
      <ButtonWithTooltip
        onClick={() => seOpenImageDialog(true)}
        title="Add image"
      >
        <PhotoIcon width={20} height={20} />
      </ButtonWithTooltip>

      <Modal
        isOpen={openImageDialog}
        onOpenChange={() => seOpenImageDialog(false)}
      >
        <ModalContent>
          {(onClose) => (
            <ModalBody>
              <div className="flex flex-col gap-2">
                <Dropzone accept={{ "image/*": [] }} onDrop={onDrop}>
                  {({ getRootProps, getInputProps }) => (
                    <section>
                      <div
                        {...getRootProps()}
                        className="flex flex-col justify-center items-center w-full"
                      >
                        <input {...getInputProps()} />
                        <div className="my-2 flex flex-col justify-center items-center w-full">
                          <PhotoIcon width={40} height={40} />
                        </div>
                        <p>
                          Drag & drop some files here, or click to select files
                        </p>
                        <Button
                          className="mt-2 pointer-events-none"
                          variant="bordered"
                        >
                          Upload
                        </Button>
                      </div>
                    </section>
                  )}
                </Dropzone>
                <div className="flex justify-center w-full">
                  <Separator className="w-[80%] my-4 bg-light-border dark:bg-dark-border h-[2px]" />
                </div>
                <Form>
                  <Controller
                    control={control}
                    name="src"
                    rules={{
                      required: "Image source is required",
                    }}
                    render={({ field, fieldState }) => (
                      <Input
                        {...field}
                        labelPlacement="outside"
                        label="Image Link"
                        placeholder="Image Link"
                        isInvalid={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="altText"
                    rules={{
                      required: "Image title is required",
                    }}
                    render={({ field, fieldState }) => (
                      <Input
                        {...field}
                        labelPlacement="outside"
                        label="Image Title"
                        placeholder="Image Title"
                        isInvalid={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                      />
                    )}
                  />
                  <div className="flex justify-end items-center w-full gap-2">
                    <Button
                      type="reset"
                      onPress={() => seOpenImageDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      isLoading={loading}
                      disabled={loading}
                      type="button"
                      onPress={() => handleSubmit(onSubmit)()}
                    >
                      {loading ? "Uploading" : "Save"}
                    </Button>
                  </div>
                </Form>
              </div>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
