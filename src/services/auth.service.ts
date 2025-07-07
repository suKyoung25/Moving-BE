/**
 * @file auth.service.ts
 * @description
 * - 인증 로직을 처리하는 서비스 계층 모듈
 * - repository에서 데이터를 조회하고, 암호화/토큰 관련 유틸 함수 사용
 *
 */

import authRepository from "../repositories/auth.repository";
import { ConflictError, NotFoundError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";
import { createMoverInput, getMoverInput } from "../types/movers";
import { hashPassword } from "../utils/auth.utils";

// 아래 코드는 예시입니다.
// async function createUser(email: string, password: string) {
//   const user = await authRepository.findByEmail(email);
//   if (!user) {
//     throw new BadRequestError(ErrorMessage.USER_NOT_FOUND);
//   }

//   const isValid = await compare(password, user.hashedPassword!);
//   if (!isValid) {
//     throw new BadRequestError(ErrorMessage.PASSWORD_NOT_MATCH);
//   }

//   return user;
// }

//기사님 생성
async function createMover(user: createMoverInput) {
  const existedNickName = await authRepository.findMoverBynickName(
    user.nickName
  );
  if (existedNickName) {
    throw new ConflictError(ErrorMessage.ALREADY_EXIST_NICKNAME);
  }
  const existedEmail = await authRepository.findMoverByEmail(user.email);
  if (existedEmail) {
    throw new ConflictError(ErrorMessage.ALREADY_EXIST_EMAIL);
  }
  const existedPhone = await authRepository.findMoverByPhone(user.phone);
  if (existedPhone) {
    throw new ConflictError(ErrorMessage.ALREADY_EXIST_PHONE);
  }

  const hashedPassword = await hashPassword(user.password);
  return await authRepository.saveMover({ ...user, hashedPassword });
}

//기사님 조회(로그인)
async function getMoverByEmail(user: getMoverInput) {
  const mover = await authRepository.findMoverByEmail(user.email);
  if (!mover) {
    throw new NotFoundError(ErrorMessage.USER_NOT_FOUND);
  }

  return mover;
}

export default {
  // createUser,
  createMover,
  getMoverByEmail,
};
