import { ImageUploadService } from "postimages-upload";
import { Buffer } from "buffer";

const service = new (ImageUploadService as any)(
  "postimages.org",
  "8c0744aa3c57541cae0032196ab1ce28"
);

export default async function uploadImageWithPostImages(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const res = await service.uploadFromBinary(buffer, file.name);
  if (!res?.directLink) {
    throw new Error("failed to upload image");
  }
  return res.directLink;
}
