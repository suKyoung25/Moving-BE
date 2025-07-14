import bcrypt from "bcrypt";
import { Client, Mover } from "@prisma/client";
import { ConflictError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";
import authClientRepository from "../repositories/authClient.repository";
import { SignUpDataLocal } from "../types";

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
