import { Strategy as KakaoStrategy, Profile } from "passport-kakao";

import { Request } from "express";
import { NotFoundError, providerMap } from "../../types";
import authClientService from "../../services/authClient.service";
import authMoverService from "../../services/authMover.service";

const kakaoStrategyOptions = {
  clientID: process.env.KAKAO_CLIENT_ID!,
  clientSecret: process.env.KAKAO_CLIENT_SECRET!,
  callbackURL: "/auth/kakao/callback",
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
  // enum <-> string 변환
  const providerEnumValue = providerMap[profile.provider];
  const userType = req.query.state || "client";

  // 데이터 형태 변환
  const kakaoAccount = profile._json?.kakao_account;
  const email = kakaoAccount?.email;

  // 이메일 없으면 오류 처리
  if (!email) {
    return done(new NotFoundError("카카오 이메일 x"));
  }

  let userInfo;
  if (userType === "client") {
    // 사용자 데이터
    userInfo = await authClientService.oAuthCreateOrUpdate({
      provider: providerEnumValue,
      providerId: profile.id.toString(),
      email: profile._json.kakao_account.email,
      name: "카카오",
    });
  } else if (userType === "mover") {
    userInfo = await authMoverService.oAuthCreateOrUpdate({
      provider: providerEnumValue,
      providerId: profile.id.toString(), //kakao는 숫자로 주기 때문에 문자로 변환 필수
      email: profile._json.kakao_account.email,
      name: "카카오",
    });
  } else {
    throw new NotFoundError("소셜 로그인해야 하는데 userType 없음");
  }

  done(null, userInfo); // req.user = user;
}

const kakaoStrategy = new KakaoStrategy(kakaoStrategyOptions, verify);

export default kakaoStrategy;
