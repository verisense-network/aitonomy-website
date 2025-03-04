import { PhotoIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  Spinner,
} from "@heroui/react";
import {
  Button as MdxEditorButton,
  insertImage$,
  Separator,
  usePublisher,
} from "@mdxeditor/editor";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";

import Dropzone from "react-dropzone";
import { uploadImage } from "@/app/actions";

export default function AddImage() {
  const insertImage = usePublisher(insertImage$);
  const [openImageDialog, seOpenImageDialog] = useState(false);
  const [imgUrl, setImgUrl] = useState({
    src: "",
    alt: "",
  });
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setLoading(true);
      console.log("acceptedFiles", acceptedFiles);
      for (const file of acceptedFiles) {
        const url = await uploadImage(file);
        insertImage({
          src: url,
          altText: file.name,
          title: file.name,
        });
      }
      toast.success(`Upload Complete`);
      seOpenImageDialog(false);
      setLoading(false);
    },
    [insertImage]
  );

  return (
    <>
      <MdxEditorButton onClick={() => seOpenImageDialog(true)}>
        <PhotoIcon width={20} height={20} />
      </MdxEditorButton>

      <Modal
        isOpen={openImageDialog}
        onOpenChange={() => seOpenImageDialog(false)}
      >
        <ModalContent>
          {(onClose) => (
            <ModalBody className="flex w-full max-w-[520px] flex-col gap-6 border-none dark:bg-dark-1 bg-light-1 shadow-md px-6 py-9">
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

                <div className="flex flex-col gap-2">
                  <label htmlFor="image_source" className="font-semibold">
                    Source link:
                  </label>
                  <Input
                    value={imgUrl.src}
                    id="image_source"
                    placeholder="Image Link"
                    className="border-none dark:bg-dark-2 bg-light-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                    onChange={(e) =>
                      setImgUrl({ ...imgUrl, src: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="image_alt" className="font-semibold">
                    Image title:
                  </label>
                  <Input
                    value={imgUrl.alt}
                    id="image_alt"
                    placeholder="Image Title"
                    className="border-none dark:bg-dark-2 bg-light-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                    onChange={(e) =>
                      setImgUrl({ ...imgUrl, alt: e.target.value })
                    }
                  />
                </div>
                <div className="flex justify-end items-center w-full gap-2">
                  <Button onPress={() => seOpenImageDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    isLoading={loading}
                    disabled={
                      loading ||
                      imgUrl.alt.trim().length === 0 ||
                      imgUrl.src.trim().length === 0
                    }
                    onPress={() => {
                      try {
                        if (
                          imgUrl.alt.trim().length === 0 ||
                          imgUrl.src.trim().length === 0
                        ) {
                          return;
                        }
                        setLoading(true);
                        insertImage({
                          src: imgUrl.src,
                          altText: imgUrl.alt,
                          title: imgUrl.alt,
                        });
                        setLoading(false);
                        seOpenImageDialog(false);
                      } catch {
                        setLoading(false);
                        toast.error("Can't Add your Image, try again.");
                      }
                    }}
                  >
                    {loading ? "Saving" : "Save"}
                  </Button>
                </div>
              </div>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
