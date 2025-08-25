import { s3 } from "../utils/uploadToS3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

async function uploadImage(file: Express.MulterS3.File, isPrivate: boolean) {
  const { location, key, originalname } = file;

  let presignedUrl: string | null = null;

  if (isPrivate) {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });
    presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  }

  return {
    url: location,
    key,
    originalname,
    presignedUrl,
  };
}

export default {
  uploadImage,
};
