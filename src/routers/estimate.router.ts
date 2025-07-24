import { Router, RequestHandler } from "express";
import estimateController from "../controllers/estimate.controller";
import { verifyAccessToken } from "../middlewares/auth.middleware";

const estimateRouter = Router();

// 작성 가능한 리뷰 목록
estimateRouter.get("/writable/me", estimateController.getWritableEstimates);

// 대기 중인 견적 조회
estimateRouter.get("/pending", estimateController.getPendingEstimates as RequestHandler);

// 견적 요청
estimateRouter.post("/create", estimateController.sendEstimateToRequest);

// 보낸 견적 요청 상세
estimateRouter.get("/sented/:id", estimateController.getSentEstimateDetail);

// 견적 거절
estimateRouter.post("/reject", estimateController.rejectEstimate);

// 보낸 견적 조회
estimateRouter.get("/sent", estimateController.getSentEstimates);

// 반려한 견적 조회
estimateRouter.get("/rejected", estimateController.getRejectedEstimates);

// 받은 견적 조회
estimateRouter.get("/received", estimateController.getReceivedEstimates as RequestHandler);

export default estimateRouter;
