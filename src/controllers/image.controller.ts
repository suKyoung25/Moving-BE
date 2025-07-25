import { NextFunction, Request, Response } from "express";
import imageService from "../services/image.service";

async function uploadImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const isPrivate = req.query.access === "private";
    const result = await imageService.uploadImage(req.file as Express.MulterS3.File, isPrivate);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export default {
  uploadImage,
};
