import { ErrorMessage } from "../constants/ErrorMessage";
import authMoverRepository from "../repositories/authMover.repository";
import {
  BadRequestError,
  CreateMoverInput,
  GetMoverInput,
  NotFoundError,
  SignUpDataSocial,
} from "../types";
import { filterSensitiveUserData, hashPassword } from "../utils/auth.util";
import { generateAccessToken, generateRefreshToken } from "../utils/token.util";

// 기사님 생성(회원가입)
async function createMover(user: CreateMoverInput) {
  const hashedPassword = await hashPassword(user.password);
  const createdMover = await authMoverRepository.saveMover({
    ...user,
    hashedPassword,
  });

  const accessToken = generateAccessToken({
    userId: createdMover.id,
    email: createdMover.email,
    name: createdMover.name!,
    userType: createdMover.userType,
    isProfileCompleted: createdMover?.isProfileCompleted,
  });
  const refreshToken = generateRefreshToken({
    userId: createdMover.id,
    email: createdMover.email,
    name: createdMover.name!,
    userType: createdMover.userType,
    isProfileCompleted: createdMover?.isProfileCompleted,
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
      isProfileCompleted: createdMover?.isProfileCompleted,
    },
  };
}

// 기사님 조회(로그인)
async function setMoverByEmail(user: GetMoverInput) {
  const mover = await authMoverRepository.getMoverByEmail(user.email);

  if (!mover) {
    throw new NotFoundError(ErrorMessage.USER_NOT_FOUND);
  }

  // 토큰 생성
  const accessToken = generateAccessToken({
    userId: mover.id,
    email: mover.email,
    name: mover.name!,
    userType: mover.userType,
    isProfileCompleted: mover?.isProfileCompleted,
  });
  const refreshToken = generateRefreshToken({
    userId: mover.id,
    email: mover.email,
    name: mover.name!,
    userType: mover.userType,
    isProfileCompleted: mover?.isProfileCompleted,
  });

  return {
    user: {
      userId: mover.id,
      email: mover.email,
      name: mover.name,
      nickName: mover?.nickName,
      userType: mover.userType,
      phone: mover.phone,
      isProfileCompleted: mover?.isProfileCompleted,
    },
    accessToken,
    refreshToken,
  };
}

// 기사님 삭제(회원 탈퇴)
async function deleteMoverById(userId: string) {
  await authMoverRepository.deleteMoverById(userId);
}

// 소셜에서 받은 정보가 DB에 없으면 (생성:create) 있으면 (수정:update)하는 함수
async function oAuthCreateOrUpdate(socialData: SignUpDataSocial) {
  const existingUser = await authMoverRepository.getMoverByEmail(socialData.email);

  if (existingUser) {
    // 이메일 있어도, 소셜 종류(provider)가 다르면 에러
    if (existingUser.provider !== socialData.provider) {
      throw new BadRequestError(`이미 ${existingUser.provider} 가입 시 사용된 이메일입니다.`);
    }

    // 유저 있으면 provider, providerId, name, phone, email 업데이트
    const user = await authMoverRepository.createOrUpdate({
      id: existingUser.id,
      provider: socialData.provider,
      providerId: socialData.providerId,
      name: socialData.name,
      email: socialData.email,
      phone: socialData.phone,
    });

    return filterSensitiveUserData(user);
  } else {
    // 유저 없으면 새로 생성
    const user = await authMoverRepository.createOrUpdate({
      provider: socialData.provider,
      providerId: socialData.providerId,
      email: socialData.email,
      name: socialData.name,
      phone: socialData.phone,
    });

    return filterSensitiveUserData(user);
  }
}

export default {
  createMover,
  deleteMoverById,
  setMoverByEmail,
  oAuthCreateOrUpdate,
};
