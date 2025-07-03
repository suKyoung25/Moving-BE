import express from "express";

const authRouter = express.Router();

/**
 * @file auth.router.ts
 * @description 인증 관련 라우트 정의 모듈 (회원가입, 로그인, 토큰갱신, 소셜로그인 등)
 *
 * 예시:
 * authRouter.post("/auth/signup", validateSignup, signUpController);
 */

export default authRouter;
