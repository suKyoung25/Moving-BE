import { ErrorMessage } from "../constants/ErrorMessage";
import { ConflictError, CreatedToken, UnauthorizedError } from "../types";
import jwt from "jsonwebtoken";

export function generateAccessToken(user: CreatedToken): string {
  const payload = {
    userId: user.userId,
    email: user.email,
    name: user.name,
    userType: user.userType,
    isProfileCompleted: user.isProfileCompleted,
  };

  const accessSecret = process.env.JWT_SECRET;
  if (!accessSecret) {
    throw new ConflictError(ErrorMessage.JWT_SECRET_NOT_FOUND);
  }

  const expiresIn = "1h";

  const accessToken = jwt.sign(payload, accessSecret, {
    expiresIn,
  } as jwt.SignOptions);

  return accessToken;
}

export function generateRefreshToken(user: CreatedToken): string {
  const payload = {
    userId: user.userId,
    email: user.email,
    name: user.name,
    userType: user.userType,
    isProfileCompleted: user.isProfileCompleted,
  };

  const refreshSecret = process.env.JWT_SECRET;
  if (!refreshSecret) {
    throw new ConflictError(ErrorMessage.JWT_SECRET_NOT_FOUND);
  }

  const expiresIn = "7d";

  const refreshToken = jwt.sign(payload, refreshSecret, {
    expiresIn,
  } as jwt.SignOptions);

  return refreshToken;
}

/**
 * @description 이메일 인증 요청 시 사용할 토큰 (만료 시간 15분)
 * @param email - 인증할 사용자의 이메일
 */
export function generateEmailVerificationToken(email: string) {
  const payload = { email, type: "email-verification" };
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "15m" });
}

/**
 * @description 이메일 인증 완료 후, 실제 회원가입 폼에서 사용할 토큰 (만료 시간 10분)
 * @param email - 인증된 사용자의 이메일
 */
export function generateSignupReadyToken(email: string) {
  const payload = { email, type: "signup-ready" };
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "10m" });
}

/**
 * @description 토큰을 검증하고 payload를 반환하는 범용 함수
 * @param token - 검증할 JWT
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    throw new UnauthorizedError("토큰이 만료되었습니다.");
  }
}
