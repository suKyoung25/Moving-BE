import express from "express";
import {
  moverCreateProfile,
  moverPatchProfile,
} from "../controllers/profile.controller";

const profileRouter = express.Router();

/**
 * @file profile.router.ts
 * @description 프로필 관련 라우트 정의 모듈 (프로필 등록, 프로필 수정 등)
 */

//기사님 프로필 등록
profileRouter.post("/mover/", moverCreateProfile);

//기사님 프로필 수정
profileRouter.patch("/mover", moverPatchProfile);

export default profileRouter;
