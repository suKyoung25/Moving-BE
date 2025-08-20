import moverController from "../controllers/mover.controller";
import { optionalAuth, verifyAccessToken } from "../middlewares/auth.middleware";
import { Router } from "express";

const moverRouter = Router();

// 전체 기사님 리스트 조회 (비회원도 가능)
moverRouter.get("/", optionalAuth, moverController.getMovers);

// 기사님 본인 프로필 조회
moverRouter.get("/profile", verifyAccessToken, moverController.getMoverProfile);

// 기사님 상세 정보
moverRouter.get("/:moverId", optionalAuth, moverController.getMoverDetail);

// 기사님 찜 토글
moverRouter.post(
  "/:moverId/toggle-favorite",
  verifyAccessToken,
  moverController.toggleFavoriteMover,
);

export default moverRouter;
