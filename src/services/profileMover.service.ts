import profileMoverRespository from "../repositories/profileMover.repository";
import { MoverProfile } from "../types";
import { generateAccessToken, generateRefreshToken } from "../utils/token.util";
import { MoveType, Prisma } from "@prisma/client";

// 기사님 프로필 생성과 수정
async function modifyMoverProfile(user: MoverProfile) {
  console.log("=== 서비스 DEBUG ===");
  console.log("Service에서 받은 사용자 데이터:", user);
  console.log("위치 정보 확인:", {
    latitude: user.latitude,
    longitude: user.longitude,
    businessAddress: user.businessAddress,
  });

  // 업데이트할 데이터 목록
  const updateData: Prisma.MoverUpdateInput = {
    profileImage: user.image,
    nickName: user.nickName,
    career: user.career,
    introduction: user.introduction,
    description: user.description,
    isProfileCompleted: true,
  };

  // 🔧 위치 정보 처리 로직 개선
  console.log("=== 위치 정보 처리 ===");

  // latitude와 longitude가 모두 제공된 경우에만 위치 정보 업데이트
  if (user.latitude !== undefined && user.longitude !== undefined) {
    console.log("✅ 위치 정보 업데이트 진행:", {
      latitude: user.latitude,
      longitude: user.longitude,
      businessAddress: user.businessAddress || null,
    });

    updateData.latitude = user.latitude;
    updateData.longitude = user.longitude;
    updateData.businessAddress = user.businessAddress || null;
  } else if (user.latitude !== undefined || user.longitude !== undefined) {
    console.log("⚠️ 위도 또는 경도 중 하나만 제공됨:", {
      latitude: user.latitude,
      longitude: user.longitude,
    });
    // 하나만 제공된 경우 둘 다 null로 설정 (일관성 유지)
    updateData.latitude = null;
    updateData.longitude = null;
    updateData.businessAddress = null;
  } else {
    console.log("ℹ️ 위치 정보가 제공되지 않음 - 기존 값 유지");
    // 위치 정보가 전혀 제공되지 않은 경우 기존 값 유지
  }

  // businessAddress만 단독으로 제공된 경우 처리
  if (
    user.businessAddress !== undefined &&
    user.latitude === undefined &&
    user.longitude === undefined
  ) {
    console.log("ℹ️ 사업장 주소만 업데이트:", user.businessAddress);
    updateData.businessAddress = user.businessAddress;
  }

  console.log("=== 최종 업데이트 데이터 ===");
  console.log("updateData:", JSON.stringify(updateData, null, 2));

  // 서비스 종류
  if (user.serviceType && user.serviceType.length > 0) {
    updateData.serviceType = {
      set: user.serviceType as MoveType[],
    };
  }

  // 서비스 지역
  if (user.serviceArea && user.serviceArea.length > 0) {
    const matchedRegions = await profileMoverRespository.findRegionByLabel(user);
    console.log("매칭된 지역:", matchedRegions);

    updateData.serviceArea = {
      set: matchedRegions.map((region) => ({ id: region.id })),
    };
  }

  // mover 정보 조회를 profileMoverRepository로 변경
  const mover = await profileMoverRespository.findById(user.userId);

  if (!mover || !mover.id || !mover.email) {
    throw new Error("필수 사용자 정보를 찾을 수 없습니다.");
  }

  console.log("=== 기존 기사님 정보 ===");
  console.log("기존 위치 정보:", {
    latitude: mover.latitude,
    longitude: mover.longitude,
    businessAddress: mover.businessAddress,
  });

  // 프로필 등록 시 토큰 재발급
  const accessToken = generateAccessToken({
    userId: mover.id,
    email: mover.email,
    name: mover.name || null, // null 허용
    userType: "mover",
    isProfileCompleted: true,
  });
  const refreshToken = generateRefreshToken({
    userId: mover.id,
    email: mover.email,
    name: mover.name || null, // null 허용
    userType: "mover",
    isProfileCompleted: true,
  });

  console.log("=== 데이터베이스 업데이트 시작 ===");
  const updatedMover = await profileMoverRespository.modifyMoverProfile(user, updateData);

  console.log("=== 업데이트 완료 ===");
  console.log("업데이트된 위치 정보:", {
    latitude: updatedMover.latitude,
    longitude: updatedMover.longitude,
    businessAddress: updatedMover.businessAddress,
  });

  return { ...updatedMover, accessToken, refreshToken };
}

export default {
  modifyMoverProfile,
};
