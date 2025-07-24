import Router from "express";
import imageController from "../controllers/image.controller";
import { upload } from "../utils/uploadToS3";

const imageRouter = Router();

imageRouter.post("/upload", upload.single("image"), imageController.uploadImage);

export default imageRouter;
