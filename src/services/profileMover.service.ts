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
import prisma from "../configs/prisma.config";

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

  return await profileMoverRespository.modifyMoverProfile(user, updateData);
}

export default {
  modifyMoverProfile,
};
