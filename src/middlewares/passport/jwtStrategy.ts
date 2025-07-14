import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import prisma from "../../configs/prisma.config";
import dotenv from "dotenv";
import { RequestHandler } from "express";
import { filterSensitiveUserData } from "../../utils/auth.util";

dotenv.config();

// 옵션: Authorization Header에서 토큰 추출
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
};

// 전략 정의
passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      let user;

      // userType에 따라 정의
      if (jwt_payload.userType === "client") {
        user = await prisma.client.findUnique({
          where: { id: jwt_payload.userId },
        });

        if (user) {
          const userData = filterSensitiveUserData(user);
          return done(null, { ...userData, userType: "client" }); // client
        }
      } else if (jwt_payload.userType === "mover") {
        user = await prisma.mover.findUnique({
          where: { id: jwt_payload.userId },
        });

        if (user) {
          const userData = filterSensitiveUserData(user);
          return done(null, { ...userData, userType: "mover" }); // mover
        }
      }

      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  }),
);

// ✅ 이걸 쓰면 됨!
const authMiddleware: RequestHandler = passport.authenticate("jwt", { session: false });

export default authMiddleware;
