import { Router } from "express";
import * as translationController from "../controllers/translation.controller";

const translationRouter = Router();

translationRouter.post("/translate", translationController.translate);

export default translationRouter;
