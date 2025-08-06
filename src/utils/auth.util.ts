import bcrypt from "bcrypt";
import { Client, Mover } from "@prisma/client";
import { ConflictError } from "../types";
import { ErrorMessage } from "../constants/ErrorMessage";
import rateLimit from "express-rate-limit";

// 비밀번호 해싱 함수
export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

// 사용자 데이터에서 민감한 정보 뺌
export function filterSensitiveUserData<T extends Client | Mover>(
  user: T,
): Omit<T, "hashedPassword" | "providerId"> {
  const { hashedPassword, providerId, ...rest } = user;
  return rest;
}

// 비밀번호 인증
export async function verifyPassword(inputPassword: string, savedPassword: string) {
  const isValid = await bcrypt.compare(inputPassword, savedPassword);

  if (!isValid) {
    throw new ConflictError(ErrorMessage.PASSWORD_NOT_MATCH);
  } else {
    return true;
  }
}

// 로그인 횟수 제한
export const loginLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30분
  max: 5,
  message: { message: "5회 이상 로그인에 실패했습니다. 최소 30분 후에 재시도해 주세요." },
  skipSuccessfulRequests: true,
  keyGenerator: (req, res) => {
    return req.body.email; // 또는 req.ip -- 막는 조건
  },
});

// 비밀번호 재설정 횟수 제한
export const passwordResetLimiter = rateLimit({
  windowMs: 365 * 24 * 60 * 60 * 1000, // 1년
  max: 2,
  message: { message: "비밀번호 재설정은 1년에 5회까지만 가능합니다." },
  keyGenerator: (req, res) => {
    return req.auth?.userId!; // 막는 조건
  },
});
