import bcrypt from "bcrypt";
import { Client, Mover } from "@prisma/client";
import { ConflictError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";
import authClientRepository from "../repositories/authClient.repository";
import { ISignUpDataLocal } from "../types";

// ✅ 비밀번호 해싱 함수
export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

// ✅ 사용자 데이터에서 민감한 정보 뺌
export function filterSensitiveUserData<T extends Client | Mover>(
  user: T,
): Omit<T, "hashedPassword" | "phone" | "providerId"> {
  const { hashedPassword, phone, providerId, ...rest } = user;
  return rest;
}

// ✅ 비밀번호 인증
export async function verifyPassword(inputPassword: string, savedPassword: string) {
  if (!savedPassword) throw new ConflictError("비밀번호를 입력하지 않았습니다.");

  const isValid = await bcrypt.compare(inputPassword, savedPassword);
  if (!isValid) throw new ConflictError("비밀번호를 잘못 입력하셨습니다.");
}

// ✅ 회원가입 유효성 검사
export async function validateSignUpData(user: ISignUpDataLocal) {
  const errors: Partial<Record<keyof ISignUpDataLocal, string>> = {};

  const existingEmail = await authClientRepository.findByEmail(user.email);
  const existingPhone = await authClientRepository.findByPhone(user.phone);

  // 이미 사용 중인 정보
  if (existingEmail) {
    errors.email = ErrorMessage.ALREADY_EXIST_EMAIL;
  }

  if (existingPhone) {
    errors.phone = ErrorMessage.ALREADY_EXIST_PHONE;
  }

  if (Object.keys(errors).length > 0) {
    throw new ConflictError(`회원가입 실패: ${JSON.stringify(errors)}`);
  }
}
