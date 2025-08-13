import imageController from "../controllers/image.controller";
import { invalidateCache } from "../middlewares/cache.middleware";
import { checkProfileImageSize } from "../middlewares/profile.middleware";
import Router from "express";

const imageRouter = Router();

imageRouter.post("/upload", checkProfileImageSize, invalidateCache(), imageController.uploadImage);

export default imageRouter;
