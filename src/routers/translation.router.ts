import { Router } from "express";
import translationController from "../controllers/translation.controller";

const translationRouter = Router();

// 번역 관련 엔드포인트
translationRouter.post("/translate", translationController.translate);

// 캐시 관리 엔드포인트
translationRouter.get("/cache/stats", translationController.getCacheStatistics);
translationRouter.delete("/cache", translationController.clearTranslationCache);

export default translationRouter;
