import { Router } from "express";
import estimateController from "../controllers/estimate.controller";
import fakeAuth from "../middlewares/fakeAuth";

const estimateRouter = Router();

// 작성 가능한 리뷰 목록
estimateRouter.get("/writable/me", fakeAuth, estimateController.getWritableEstimates);

// 견적 요청 생성
estimateRouter.post("/requests", estimateController.createEstimateRequest);

export default estimateRouter;
