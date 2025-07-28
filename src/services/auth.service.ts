import authRepository from "../repositories/auth.repository";
import { SignUpDataSocial } from "../types";
import { BadRequestError } from "../types/errors";
import { filterSensitiveUserData } from "../utils/auth.util";
import { generateAccessToken, generateRefreshToken } from "../utils/token.util";

// ✅ 소셜 로그인
async function oAuthCreateOrUpdate(data: SignUpDataSocial) {
  // 1. 이메일로 사용자가 있는지 찾음
  const { email, ...rest } = data;
  const existingUser = await authRepository.findByEmailRaw(email);

  // 2. 이미 존재하는 사용자면 없는 정보 추가: email 넘기는지 여부 확인 필요
  let user;
  if (existingUser) {
    if (existingUser.provider !== data.provider)
      throw new BadRequestError(`이미 ${existingUser.provider}로 가입된 이메일입니다.`);
    user = await authRepository.update(existingUser.id, rest);
  } else {
    // 3. 없으면 자료 자체를 새로 생성
    user = await authRepository.save(data);
  }

  // 토큰 넣음: userType에서 오류 내서 hard coding함
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    name: user.name!,
    userType: "client",
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    name: user.name!,
    userType: "client",
  });

  user = filterSensitiveUserData(user);
  return { accessToken, refreshToken, user };
}

const authService = { oAuthCreateOrUpdate };
export default authService;
