import profileClientController from "../controllers/client.controller";
import profileMoverController from "../controllers/profileMover.controller";
import { MoverProfileSchema } from "../dtos/mover.dto";
import { validateReq, verifyAccessToken } from "../middlewares/auth.middleware";
import express from "express";
import { checkMoverProfileInfo } from "../middlewares/profile.middleware";

const profileRouter = express.Router();

// 기사님 프로필 생성&수정
profileRouter.patch(
  "/mover",
  verifyAccessToken,
  validateReq(MoverProfileSchema),
  checkMoverProfileInfo,
  profileMoverController.moverPatchProfile,
);

// 일반 회원 프로필 등록 & 수정
profileRouter.patch("/clients", verifyAccessToken, profileClientController.update);

export default profileRouter;
