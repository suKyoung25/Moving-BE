import express from "express";
import { moverSignin, moverSignup } from "../controllers/authMover.controller";
import {
  clientLoginController,
  clientSignUpController,
} from "../controllers/authClient.controller";

const authRouter = express.Router();

//기사님 회원가입
authRouter.post("/signup/mover", moverSignup);

//기사님 로그인
authRouter.post("/signin/mover", moverSignin);

// ✅ 일반 회원 Auth
authRouter.post("/signup/client", clientSignUpController);
authRouter.post("/signin/client", clientLoginController);

export default authRouter;
