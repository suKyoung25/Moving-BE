import authMoverRepository from "@/repositories/authMover.repository";
import profileMoverRespository from "@/repositories/profileMover.respository";
import { MoverProfile } from "@/types";
import { generateAccessToken, generateRefreshToken } from "@/utils/token.util";
import { MoveType, Prisma } from "@prisma/client";

// 기사님 프로필 생성과 수정
async function modifyMoverProfile(user: MoverProfile) {
  // 업데이트할 데이터 목록
  const updateData: Prisma.MoverUpdateInput = {
    profileImage: user.image,
    nickName: user.nickName,
    career: user.career,
    introduction: user.introduction,
    description: user.description,
    isProfileCompleted: true,
  };

  // 서비스 종류
  if (user.serviceType && user.serviceType.length > 0) {
    updateData.serviceType = {
      set: user.serviceType as MoveType[],
    };
  }

  // 서비스 지역
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
