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
<<<<<<< HEAD
import bcrypt from "bcrypt";
import { CreateMoverInput, GetMoverInput } from "../types";

//기사님 생성
async function createMover(user: CreateMoverInput) {
  const existedEmail = await authRepository.findMoverByEmail(user.email);
  if (existedEmail) {
    throw new ConflictError(ErrorMessage.ALREADY_EXIST_EMAIL);
  }
  const existedPhone = await authRepository.findMoverByPhone(user.phone);
  if (existedPhone) {
    throw new ConflictError(ErrorMessage.ALREADY_EXIST_PHONE);
  }

=======
import { createMoverInput, getMoverInput } from "../types";

//기사님 생성
async function createMover(user: createMoverInput) {
>>>>>>> fix/mover-myPage-basicInfo-react-hook-form
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
<<<<<<< HEAD
    userId: createdMover.id,
    email: createdMover.email,
    nickName: createdMover.nickName,
    userType: createdMover.userType,
    profileCompleted: createdMover.profileCompleted,
=======
    user: {
      userId: createdMover.id,
      email: createdMover.email,
      name: createdMover.name,
      phone: createdMover.phone,
      userType: createdMover.userType,
    },
>>>>>>> fix/mover-myPage-basicInfo-react-hook-form
  };
}

//기사님 조회(로그인)
<<<<<<< HEAD
async function getMoverByEmail(user: GetMoverInput) {
  //사용자 조회
  const mover = await authRepository.findMoverByEmail(user.email);
  if (!mover) {
    throw new NotFoundError(ErrorMessage.USER_NOT_FOUND);
  }

  //비밀번호 대조
  const isPasswordValid = await bcrypt.compare(user.password, mover.hashedPassword!);
  if (!isPasswordValid) {
    throw new UnauthorizedError(ErrorMessage.PASSWORD_NOT_MATCH);
  }
=======
async function setMoverByEmail(user: getMoverInput) {
  const mover = await authRepository.getMoverByEmail(user.email);
>>>>>>> fix/mover-myPage-basicInfo-react-hook-form

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
<<<<<<< HEAD
=======
    user: {
      userId: mover?.id,
      email: mover?.email,
      name: mover?.name,
      userType: mover?.userType,
      phone: mover?.phone,
    },
>>>>>>> fix/mover-myPage-basicInfo-react-hook-form
    accessToken,
    refreshToken,
    userId: mover.id,
    email: mover.email,
    nickName: mover.nickName,
    userType: mover.userType,
    profileCompleted: mover.profileCompleted,
  };
}

export default {
  createMover,
  setMoverByEmail,
};
