import { Router } from "express";
import requestController from "../controllers/request.controller";

const requestRouter = Router();

// 견적 요청 중간 상태 조회
requestRouter.get("/draft", requestController.getDraft);

// 견적 요청 중간 상태 저장/업데이트
requestRouter.patch("/draft", requestController.saveDraft);

// 견적 요청 (일반 유저)
requestRouter.post("/", requestController.createRequest);

// 받은 요청 조회 (기사님)
requestRouter.get("/", requestController.getReceivedRequests);

// 받은 요청 조회 (일반 유저)
requestRouter.get("/client/active", requestController.getClientActiveRequests);

// 기사님 지정 요청 (일반 > 기사)
requestRouter.patch("/movers/:moverId", requestController.designateMover);

export default requestRouter;
