import { Buffer } from "buffer";
import storage from "./googleStorage";
import { ImageUploadService } from "postimages-upload";
import { ArrayBuffer as SparkArrayBuffer } from "spark-md5";

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

  try {
    const bucket = storage.bucket(bucketName);
    const spark = new SparkArrayBuffer();
    spark.append(arrayBuffer);
    const filename = file.name.replace(/\s/g, "_");
    const uploadPath = `${destination}/${spark.end()}-${filename}`;
    const bucketFile = bucket.file(uploadPath);

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${uploadPath}`;

    const [exists] = await bucketFile.exists();
    if (exists) {
      return publicUrl;
    }

    await bucketFile.save(Buffer.from(arrayBuffer), {
      gzip: true,
      metadata: {
        cacheControl: "public, max-age=31536000",
      },
    });

    return publicUrl;
  } catch (error) {
    console.error("error uploading image", error);
    throw new Error("failed to upload image");
  }
}
