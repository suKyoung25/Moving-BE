import { Router, RequestHandler } from "express";
import estimateController from "../controllers/estimate.controller";

const estimateRouter = Router();

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

// 견적 확정
estimateRouter.post("/confirmed", estimateController.confirmEstimate);

export default estimateRouter;
