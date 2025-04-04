import { Buffer } from "buffer";
import storage from "./googleStorage";
import { ImageUploadService } from "postimages-upload";

const service = new (ImageUploadService as any)(
  "postimages.org",
  "8c0744aa3c57541cae0032196ab1ce28"
);

export async function uploadImageWithPostImages(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const res = await service.uploadFromBinary(buffer, file.name);
  if (!res?.directLink) {
    throw new Error("failed to upload image");
  }
  return res.directLink;
}

const bucketName = "aitonomy-image";
const destination = "upload-image";

export async function uploadImageWithGoogleStorage(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const bucket = storage.bucket(bucketName);
    const bucketFile = bucket.file(`${destination}/${file.name}`);

    await bucketFile.save(buffer);

    const signedUrl = await bucketFile.getSignedUrl({
      action: "read",
      expires: Date.now() + 3600 * 1000,
    });
    return signedUrl;
  } catch (error) {
    console.error("error uploading image", error);
    throw new Error("failed to upload image");
  }
}
