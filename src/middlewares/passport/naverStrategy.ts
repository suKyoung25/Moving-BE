import { Strategy as NaverStrategy, Profile } from "passport-naver";
import { NotFoundError, providerMap } from "../../types";
import { Request } from "express";
import authClientService from "../../services/authClient.service";
import authMoverService from "../../services/authMover.service";

const naverStrategyOptions = {
  clientID: process.env.NAVER_CLIENT_ID!,
  clientSecret: process.env.NAVER_CLIENT_SECRET!,
  callbackURL: "/auth/naver/callback",
  passReqToCallback: true as const, // 쿼리 문자열에 userType 넣음
};

//  인증 함수 실행해서 프로필 정보를 id 코드로 넘김
async function verify(
  req: Request,
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  done: (error: any, user?: any) => void,
) {
  // enum <-> string 변환
  const providerEnumValue = providerMap[profile.provider];
  const userType = req.query.state || "client";

  // 이메일 없으면 오류 처리
  if (!profile._json.email) {
    return done(new NotFoundError("이메일을 받지 못해 네이버 로그인에 실패했습니다."));
  }

  // 사용자 데이터
  let userInfo;
  if (userType === "client") {
    userInfo = await authClientService.oAuthCreateOrUpdate({
      provider: providerEnumValue,
      providerId: profile.id,
      email: profile._json.email,
      name: "네이버",
      phone: (profile._json as any).mobile, // 타입 오류 수정
    });
  } else if (userType === "mover") {
    userInfo = await authMoverService.oAuthCreateOrUpdate({
      provider: providerEnumValue,
      providerId: profile.id,
      email: profile._json.email,
      name: "네이버",
      phone: (profile._json as any).mobile,
    });
  } else {
    throw new NotFoundError("소셜 로그인: userType을 식별하지 못했습니다.");
  }

  done(null, userInfo); // req.user = user;
}

const naverStrategy = new NaverStrategy(naverStrategyOptions, verify);

export default naverStrategy;
