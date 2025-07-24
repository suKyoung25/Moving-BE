import express from "express";
import clientController from "../controllers/client.controller";
import { validateReq, verifyAccessToken } from "../middlewares/auth.middleware";
import profileMoverController from "../controllers/profileMover.controller";
import { MoverProfileSchema } from "../dtos/mover.dto";

const profileRouter = express.Router();

/**
 * @file profile.router.ts
 * @description 프로필 관련 라우트 정의 모듈 (프로필 등록, 프로필 수정 등)
 */

//  TODO 삭제 예정//기사님 프로필 등록
// profileRouter.post(
//   "/mover",
//   verifyAccessToken,
//   validateReq(MoverProfileSchema),
//   profileMoverController.moverCreateProfile,
// );

//기사님 프로필 생성&수정
profileRouter.patch(
  "/mover",
  verifyAccessToken,
  validateReq(MoverProfileSchema),
  profileMoverController.moverPatchProfile,
);

// 일반 회원 프로필 등록 & 수정
profileRouter.patch("/clients", verifyAccessToken, clientController.update);

export default profileRouter;
