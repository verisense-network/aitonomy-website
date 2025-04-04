import { Buffer } from "buffer";
import storage from "./googleStorage";

const bucketName = "aitonomy-image";
const destination = "upload-image";

export default async function uploadImageWithPostImages(file: File) {
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
