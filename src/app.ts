import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import "./configs/passport.config";
import errorHandler from "./middlewares/errorHandler";
import authRouter from "./routers/auth.router";
import infoRouter from "./routers/info.router";
import { specs, swaggerUi } from "./swagger";
import moverRouter from "./routers/mover.router";
import profileRouter from "./routers/profile.router";
import reviewRouter from "./routers/review.router";
import estimateRouter from "./routers/estimate.router";
import requestRouter from "./routers/request.router";
import { verifyAccessToken } from "./middlewares/auth.middleware";
import favoriteRouter from "./routers/favorite.router";
import accountRouter from "./routers/account.router";
import notificationRouter from "./routers/notification.router";
import imageRouter from "./routers/image.router";
import "./schedule/notification.cron";
import helmet from "helmet";
import morgan from "morgan";
import translationRouter from "./routers/translation.router";
import communityRouter from "./routers/community.router";

const app = express();

// trust proxy 설정 (쿠키 보안 관련: production 시 필요)
app.set("trust proxy", 1);

// 미들웨어
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
// 파일 업로드 크기 제한 설정
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(process.env.NODE_ENV === "production" ? morgan("combined") : morgan("dev"));

// 라우터 등록
app.use("/", infoRouter);
app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/dashboard", verifyAccessToken, accountRouter);
app.use("/movers", moverRouter);
app.use("/reviews", reviewRouter);
app.use("/estimates", verifyAccessToken, estimateRouter);
app.use("/favorites", verifyAccessToken, favoriteRouter);
app.use("/requests", verifyAccessToken, requestRouter);
app.use("/community", communityRouter);
app.use("/notifications", verifyAccessToken, notificationRouter);
app.use("/images", verifyAccessToken, imageRouter);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/api/translation", translationRouter);

// 에러 핸들러
app.use(errorHandler);

export default app;
