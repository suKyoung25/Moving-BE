import estimateController from "../controllers/estimate.controller";
import { Router, RequestHandler } from "express";
import { translationMiddleware } from "../middlewares/translation.middleware";
import { cacheMiddleware, invalidateCache } from "../middlewares/cache.middleware";

const estimateRouter = Router();

// 대기 중인 견적 조회
estimateRouter.get(
  "/pending",
  translationMiddleware([
    "data.estimate.comment",
    "data.request.fromAddress",
    "data.request.toAddress",
  ]),
  cacheMiddleware(),
  estimateController.getPendingEstimates as RequestHandler,
);

// 견적 요청
estimateRouter.post("/create", invalidateCache(), estimateController.sendEstimateToRequest);

// 보낸 견적 요청 상세
estimateRouter.get(
  "/sented/:id",
  translationMiddleware(["data.request.fromAddress", "data.request.toAddress"]),
  cacheMiddleware(),
  estimateController.getSentEstimateDetail,
);

// 견적 거절
estimateRouter.post("/reject", invalidateCache(), estimateController.rejectEstimate);

// 보낸 견적 조회
estimateRouter.get(
  "/sent",
  translationMiddleware(["data.comment", "data.request.fromAddress", "data.request.toAddress"]),
  cacheMiddleware(),
  estimateController.getSentEstimates,
);

// 반려한 견적 조회
estimateRouter.get(
  "/rejected",
  translationMiddleware(["data.comment", "data.request.fromAddress", "data.request.toAddress"]),
  cacheMiddleware(),
  estimateController.getRejectedEstimates,
);

// 받은 견적 조회
estimateRouter.get(
  "/received",
  translationMiddleware([
    "data.estimate.comment",
    "data.request.fromAddress",
    "data.request.toAddress",
  ]),
  cacheMiddleware(),
  estimateController.getReceivedEstimates as RequestHandler,
);

// 견적 확정
estimateRouter.post("/confirmed", invalidateCache(), estimateController.confirmEstimate);

// 견적 상세 조회
estimateRouter.get(
  "/client/:estimateId",
  translationMiddleware(["data.comment", "data.request.fromAddress", "data.request.toAddress"]),
  cacheMiddleware(),
  estimateController.getEstimateDetail,
);

// 견적 상세 조회 (알림용)
estimateRouter.get("/:estimateId", cacheMiddleware(), estimateController.getEstimateById);

// 견적 거절 및 요청 취소
estimateRouter.delete("/:id", invalidateCache(), estimateController.deleteEstimate);

export default estimateRouter;
