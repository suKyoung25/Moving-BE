import express from "express";
import { moverSignin, moverSignup } from "../controllers/authMover.controller";
import {
  clientLoginController,
  clientSignUpController,
} from "../controllers/authClient.controller";
import { getMeController, refreshTokenController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/passport/jwtStrategy";

const authRouter = express.Router();

// 토큰 재생성
authRouter.post("/refresh-token", refreshTokenController);

// 사용자 불러오기
authRouter.get("/", authMiddleware, getMeController);

//기사님 회원가입
authRouter.post("/signup/mover", moverSignup);

//기사님 로그인
authRouter.post("/signin/mover", moverSignin);

// 일반 회원가입 - Local
authRouter.post("/signup/client", clientSignUpController);

// 일반 로그인 - Local
authRouter.post("/signin/client", clientLoginController);

export default authRouter;
