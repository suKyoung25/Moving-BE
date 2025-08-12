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
  // 파일 크기 제한 설정 (10MB)
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  // 파일 필터링
  fileFilter: (req, file, cb) => {
    // 이미지 파일만 허용
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("이미지 파일만 업로드 가능합니다."));
    }
  },
});
