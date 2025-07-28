import multer from "multer";
import multerS3 from "multer-s3";
import { Request } from "express";
import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME as string,
    key: (req: Request, file, cb) => {
      const isPrivate = req.query.access === "private";
      const folder = isPrivate ? "private/" : "public/";
      cb(null, `${folder}${Date.now()}_${file.originalname}`);
    },
  }),
});
