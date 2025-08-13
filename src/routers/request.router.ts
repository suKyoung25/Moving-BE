import requestController from "../controllers/request.controller";
import { Router } from "express";
import { translationMiddleware } from "../middlewares/translation.middleware";
import { cacheMiddleware, invalidateCache } from "../middlewares/cache.middleware";

const requestRouter = Router();

// 견적 요청 중간 상태 조회
requestRouter.get(
  "/draft",
  translationMiddleware(["data.fromAddress", "data.toAddress"]),
  cacheMiddleware(),
  requestController.getDraft,
);

// 견적 요청 중간 상태 저장/업데이트
requestRouter.patch("/draft", invalidateCache(), requestController.saveDraft);

// 활성 견적 요청 조회 (일반 유저)
requestRouter.get(
  "/client/active",
  translationMiddleware(["data.fromAddress", "data.toAddress"]),
  cacheMiddleware(),
  requestController.getClientActiveRequest,
);

// 보낸 견적 요청 목록 조회 (일반 유저)
requestRouter.get(
  "/client",
  translationMiddleware([
    "requests.fromAddress",
    "requests.toAddress",
    "requests.estimates.comment",
  ]),
  cacheMiddleware(),
  requestController.getRequests,
);

// 받은 요청 상세 조회(기사님)
requestRouter.get(
  "/detail/:id",
  translationMiddleware(["request.fromAddress", "request.toAddress"]),
  cacheMiddleware(),
  requestController.getReceivedRequestDetail,
);

// 기사님 지정 요청 (일반 > 기사)
requestRouter.patch("/movers/:moverId", invalidateCache(), requestController.designateMover);

// 받은 요청 목록 조회 (기사님)
requestRouter.get(
  "/",
  translationMiddleware(["requests.fromAddress", "requests.toAddress"]),
  cacheMiddleware(),
  requestController.getReceivedRequests,
);

// 견적 요청 (일반 유저)
requestRouter.post("/", invalidateCache(), requestController.createRequest);

// 견적 요청 상세 조회
requestRouter.get(
  "/:id",
  translationMiddleware(["data.fromAddress", "data.toAddress"]),
  cacheMiddleware(),
  requestController.getRequest,
);

// 견적 요청 취소 (일반 유저)
requestRouter.delete("/:id", invalidateCache(), requestController.cancelRequest);

export default requestRouter;
