/**
 * @file profile.service.ts
 * @description
 * - 프로필 관련 로직을 처리하는 서비스 계층 모듈
 * - repository에서 데이터를 조회하고, 암호화/토큰 관련 유틸 함수 사용
 *
 */

import { MoveType, Prisma } from "@prisma/client";
import profileMoverRespository from "../repositories/profileMover.respository";
import { MoverProfile } from "../types";
import { generateAccessToken, generateRefreshToken } from "../utils/token.util";
import authMoverRepository from "../repositories/authMover.repository";

//기사님 프로필 생성과 수정
async function modifyMoverProfile(user: MoverProfile) {
  //업데이트할 데이터 목록
  const updateData: Prisma.MoverUpdateInput = {
    profileImage: user.image,
    nickName: user.nickName,
    career: user.career,
    introduction: user.introduction,
    description: user.description,
    isProfileCompleted: true,
  };

  //서비스 종류
  if (user.serviceType && user.serviceType.length > 0) {
    updateData.serviceType = {
      set: user.serviceType as MoveType[], // (enum 타입)
    };
  }

  //서비스 지역
  if (user.serviceArea && user.serviceArea.length > 0) {
    const matchedRegions = await profileMoverRespository.findRegionByLabel(user);

    updateData.serviceArea = {
      set: matchedRegions.map((region) => ({ id: region.id })),
    };
  }

  const mover = await authMoverRepository.findMoverById(user.userId);

  if (!mover) return null;

  // 프로필 등록 시 토큰 재발급
  const accessToken = generateAccessToken({
    userId: mover.id,
    email: mover.email,
    name: mover.name,
    userType: "mover",
    isProfileCompleted: true,
  });
  const refreshToken = generateRefreshToken({
    userId: mover.id,
    email: mover.email,
    name: mover.name,
    userType: "mover",
    isProfileCompleted: true,
  });

  const updatedMover = await profileMoverRespository.modifyMoverProfile(user, updateData);

  return { ...updatedMover, accessToken, refreshToken };
}

export default {
  modifyMoverProfile,
};
