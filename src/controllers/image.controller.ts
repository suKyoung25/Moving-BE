import multer from "multer";
import imageService from "../services/image.service";
import { NextFunction, Request, Response } from "express";

async function uploadImage(req: Request, res: Response, next: NextFunction) {
  try {
    // multer의 이미지 용량 에러 처리
    if ((req as any).multerError) {
      return res.status(400).json({ error: (req as any).multerError });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const isPrivate = req.query.access === "private";
    const result = await imageService.uploadImage(req.file as Express.MulterS3.File, isPrivate);

    res.status(201).json(result);
  } catch (error) {
    // multer의 용량 초과 에러인 경우
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "파일 크기는 10MB 이하만 업로드 가능합니다." });
    }
    next(error);
  }
}

export default {
  uploadImage,
};
