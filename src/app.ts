import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import errorHandler from "./middlewares/errorHandler";
import authRouter from "./routers/auth.router";
import "./configs/passport.config";

const app = express();

// trust proxy 설정 (쿠키 보안 관련: production 시 필요)
app.set("trust proxy", 1);

// 미들웨어
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// 라우터 등록
app.use("/auth", authRouter);

// 에러 핸들러
app.use(errorHandler);

export default app;
