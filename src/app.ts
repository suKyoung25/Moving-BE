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

const app = express();
const PORT = process.env.PORT || 3000;

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
app.use("/", infoRouter);
app.use("/auth", authRouter);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/movers", moverRouter)

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
