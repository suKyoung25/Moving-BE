// 나중에 파일 쓸 일 있을까 싶어 지우지는 않음.
// 공용 함수는 auth.util.ts로 통합

import { ErrorMessage } from "../constants/ErrorMessage";
import authClientRepository from "../repositories/authClient.repository";
import { ISignUpDataLocal } from "../types";
import { BadRequestError } from "../types/errors";

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

  // 유효성 검사
  // function isValidEmail(email: Client["email"]) {
  //   return /^0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z*.[a-zA-Z]{2,3}$/i.test(email);
  // }

  // if (!user.email) {
  //   errors.email = "이메일을 입력해 주세요.";
  // } else if (!isValidEmail(user.email)) {
  //   errors.email = "올바르지 않은 이메일 형식입니다.";
  // }

  // function isValidPassword(password: string) {
  //   return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
  // }

  // if (!user.hashedPassword) {
  //   errors.hashedPassword = "비밀번호를 입력해 주세요.";
  // } else if (user.hashedPassword.length < 8) {
  //   errors.hashedPassword = "비밀번호는 최소 8자 이상이어야 합니다.";
  // } else if (!isValidPassword(user.hashedPassword)) {
  //   errors.hashedPassword = "올바르지 않은 비밀번호 형식입니다.";
  // }

  if (Object.keys(errors).length > 0) {
    throw new BadRequestError(`회원가입 실패: ${JSON.stringify(errors)}`);
  }
}
