import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { Request } from "express";
import { BadRequestError, NotFoundError, providerMap } from "../../types";
import authClientService from "../../services/authClient.service";
import authMoverService from "../../services/authMover.service";

const googleStrategyOptions = {
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: "/auth/google/callback",
  passReqToCallback: true as const, // 쿼리 문자열에 userType 넣음
};

// 인증 함수 실행해서 프로필 정보를 id 코드로 넘김
async function verify(
  req: Request,
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  done: (error: any, user?: any) => void,
) {
  try {
    // enum <-> string 변환
    const providerEnumValue = providerMap[profile.provider];
    const userType = req.query.state || "client";

    // 이메일 없으면 오류 처리
    if (!profile.emails || profile.emails.length === 0) {
      return done(new BadRequestError("이메일을 받지 못해 구글 로그인에 실패했습니다."));
    }

    // 사용자 데이터
    let userInfo;
    if (userType === "client") {
      // 사용자 데이터
      userInfo = await authClientService.oAuthCreateOrUpdate({
        provider: providerEnumValue,
        providerId: profile.id,
        email: profile.emails[0].value,
        name: "구글", // 구글 이름 안 받음
      });
    } else if (userType === "mover") {
      userInfo = await authMoverService.oAuthCreateOrUpdate({
        provider: providerEnumValue,
        providerId: profile.id,
        email: profile.emails[0].value,
        name: "구글",
      });
    } else {
      throw new BadRequestError("소셜 로그인: userType을 식별하지 못했습니다.");
    }

    done(null, userInfo); // req.user = user;
  } catch (error: any) {
    if (error.name === "Bad Request") {
      return done(error);
    }
    return done(new BadRequestError("소셜 로그인 중 오류가 발생했습니다."));
  }
}

const googleStrategy = new GoogleStrategy(googleStrategyOptions, verify);

export default googleStrategy;
