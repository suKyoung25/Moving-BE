import { Router } from "express";
import estimateController from "../controllers/estimate.controller";

const estimateRouter = Router();

// 작성 가능한 리뷰 목록
estimateRouter.get("/writable/me", estimateController.getWritableEstimates);

export default estimateRouter;
