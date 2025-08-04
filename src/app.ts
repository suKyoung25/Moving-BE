import "dotenv/config";
import express from "express";
import figlet from "figlet";
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

const app = express();
const PORT = process.env.PORT;

// trust proxy 설정 (쿠키 보안 관련: production 시 필요)
app.set("trust proxy", true);

// 미들웨어
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

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
app.use("/notifications", verifyAccessToken, notificationRouter);
app.use("/images", verifyAccessToken, imageRouter);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));

// 에러 핸들러
app.use(errorHandler);

app.listen(PORT, () => {
  figlet("Team4 Moving", (err, data) => {
    if (err) {
      console.log("Something went wrong with figlet");
      console.dir(err);
      return;
    }
    console.log(data || `Server started at port ${PORT}`);
  });
});
