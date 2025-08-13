import imageController from "../controllers/image.controller";
import { checkProfileImageSize } from "../middlewares/profile.middleware";
import Router from "express";

const imageRouter = Router();

imageRouter.post("/upload", checkProfileImageSize, imageController.uploadImage);

export default imageRouter;
