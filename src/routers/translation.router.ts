import { Router } from "express";
import * as translationController from "../controllers/translation.controller";
import { invalidateCache } from "../middlewares/cache.middleware";

const translationRouter = Router();

translationRouter.post("/translate", invalidateCache(), translationController.translate);

export default translationRouter;
