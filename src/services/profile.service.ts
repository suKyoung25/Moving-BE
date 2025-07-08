/**
 * @file profile.service.ts
 * @description
 * - 프로필 관련 로직을 처리하는 서비스 계층 모듈
 * - repository에서 데이터를 조회하고, 암호화/토큰 관련 유틸 함수 사용
 *
 */

import profileRepository from "../repositories/profile.repository";
import { ConflictError, NotFoundError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";
import { createMoverInput, getMoverInput } from "../types/movers";
import { hashPassword } from "../utils/profile.utils";

// 아래 코드는 예시입니다.
// async function createUser(email: string, password: string) {
//   const user = await profileRepository.findByEmail(email);
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
  const existedNickName = await profileRepository.findMoverBynickName(
    user.nickName
  );
  if (existedNickName) {
    throw new ConflictError(ErrorMessage.ALREADY_EXIST_NICKNAME);
  }
  const existedEmail = await profileRepository.findMoverByEmail(user.email);
  if (existedEmail) {
    throw new ConflictError(ErrorMessage.ALREADY_EXIST_EMAIL);
  }
  const existedPhone = await profileRepository.findMoverByPhone(user.phone);
  if (existedPhone) {
    throw new ConflictError(ErrorMessage.ALREADY_EXIST_PHONE);
  }

  const hashedPassword = await hashPassword(user.password);
  return await profileRepository.saveMover({ ...user, hashedPassword });
}
