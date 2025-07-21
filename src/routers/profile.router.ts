import express from "express";
<<<<<<< HEAD
import profileMoverController from "../controllers/profileMover.controller";
=======
import profileClientController from "../controllers/profileClient.controller";
import { verifyAccessToken } from "../middlewares/auth.middleware";
>>>>>>> fix/mover-myPage-basicInfo-react-hook-form

const profileRouter = express.Router();

/**
 * @file profile.router.ts
 * @description 프로필 관련 라우트 정의 모듈 (프로필 등록, 프로필 수정 등)
 */

//기사님 프로필 등록
profileRouter.post("/mover", profileMoverController.moverCreateProfile);

//기사님 프로필 수정
profileRouter.patch("/mover", profileMoverController.moverPatchProfile);

// 일반 유저 프로필 등록
profileRouter.patch("/clients", verifyAccessToken, profileClientController.post);

export default profileRouter;
