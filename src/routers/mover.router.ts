import moverController from "../controllers/mover.controller";
import { optionalAuth, verifyAccessToken } from "../middlewares/auth.middleware";
import express from "express";
import { translationMiddleware } from "../middlewares/translation.middleware";
import { cacheMiddleware } from "../middlewares/cache.middleware";

const { getMovers, getMoverDetail, toggleFavoriteMover, getMoverProfile } = moverController;

const moverRouter = express.Router();

// 전체 기사님 리스트 조회 (비회원도 가능)
moverRouter.get(
  "/",
  optionalAuth,
  translationMiddleware(["movers.introduction"]),
  cacheMiddleware(300),
  getMovers,
);

// 기사님 본인 프로필 조회
moverRouter.get(
  "/profile",
  verifyAccessToken,
  translationMiddleware(["data.introduction", "data.description"]),
  cacheMiddleware(300),
  getMoverProfile,
);

// 기사님 상세 정보
moverRouter.get(
  "/:moverId",
  optionalAuth,
  translationMiddleware(["introduction", "description"]),
  cacheMiddleware(300),
  getMoverDetail,
);

// 기사님 찜 토글
moverRouter.post("/:moverId/toggle-favorite", verifyAccessToken, toggleFavoriteMover);

export default moverRouter;
