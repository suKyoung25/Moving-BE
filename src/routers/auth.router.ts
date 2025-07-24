import express from "express";
import { moverSignin, moverSingup } from "../controllers/authMover.controller";
import authController from "../controllers/auth.controller";
import authClientController from "../controllers/authClient.controller";
import {
  checkClientSignUpInfo,
  checkMoverDuplicateSignin,
  checkMoverDuplicateSignup,
  validateReq,
  verifyAccessToken,
} from "../middlewares/auth.middleware";
import { signInSchema, signUpSchema } from "../dtos/auth.dto";

const authRouter = express.Router();

// 토큰 재생성
authRouter.post("/refresh-token", authController.setRefreshToken);

// 사용자 불러오기
authRouter.get("/", verifyAccessToken, authController.getMe);

//기사님 회원가입 - Local
authRouter.post("/signup/mover", validateReq(signUpSchema), checkMoverDuplicateSignup, moverSingup);

//기사님 로그인 - Local
authRouter.post("/signin/mover", validateReq(signInSchema), checkMoverDuplicateSignin, moverSignin);

// 일반 회원가입 - Local
authRouter.post(
  "/signup/client",
  validateReq(signUpSchema),
  checkClientSignUpInfo,
  authClientController.signUp,
);

// 일반 로그인 - Local
authRouter.post("/signin/client", validateReq(signInSchema), authClientController.login);

export default authRouter;
