import express from "express";
import { moverSignin, moverSignup } from "../controllers/authMover.controller";
import {
  clientLoginController,
  clientSignUpController,
} from "../controllers/authClient.controller";
import { refreshTokenController } from "../controllers/auth.controller";

const authRouter = express.Router();

// 토큰 재생성
authRouter.post("/refresh-token", refreshTokenController);

//기사님 회원가입
authRouter.post("/signup/mover", moverSignup);

//기사님 로그인
authRouter.post("/signin/mover", moverSignin);

// 일반인 회원가입
authRouter.post("/signup/client", clientSignUpController);

// 일반인 로그인
authRouter.post("/signin/client", clientLoginController);

export default authRouter;
