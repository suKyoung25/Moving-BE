/**
 * @file auth.service.ts
 * @description
 * - 인증 로직을 처리하는 서비스 계층 모듈
 * - repository에서 데이터를 조회하고, 암호화/토큰 관련 유틸 함수 사용
 *
 */

import authRepository from "../repositories/authMover.repository";
import { ConflictError, NotFoundError, UnauthorizedError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";
import { hashPassword } from "../utils/auth.util";
import { generateAccessToken, generateRefreshToken } from "../utils/token.util";
import { createMoverInput, getMoverInput } from "../types";

//기사님 생성
async function createMover(user: createMoverInput) {
  const hashedPassword = await hashPassword(user.password);
  const createdMover = await authRepository.saveMover({
    ...user,
    hashedPassword,
  });

  const accessToken = generateAccessToken({
    userId: createdMover.id,
    email: createdMover.email,
    name: createdMover.name,
    userType: createdMover.userType,
  });
  const refreshToken = generateRefreshToken({
    userId: createdMover.id,
    email: createdMover.email,
    name: createdMover.name,
    userType: createdMover.userType,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      userId: createdMover.id,
      email: createdMover.email,
      name: createdMover.name,
      phone: createdMover.phone,
      userType: createdMover.userType,
    },
  };
}

//기사님 조회(로그인)
async function setMoverByEmail(user: getMoverInput) {
  const mover = await authRepository.getMoverByEmail(user.email);

  //토큰 생성
  const accessToken = generateAccessToken({
    userId: mover?.id!,
    email: mover?.email!,
    name: mover?.name!,
    userType: mover?.userType!,
  });
  const refreshToken = generateRefreshToken({
    userId: mover?.id!,
    email: mover?.email!,
    name: mover?.name!,
    userType: mover?.userType!,
  });

  return {
    user: {
      userId: mover?.id,
      email: mover?.email,
      name: mover?.name,
      userType: mover?.userType,
      phone: mover?.phone,
    },
    accessToken,
    refreshToken,
  };
}

export default {
  createMover,
  setMoverByEmail,
};
