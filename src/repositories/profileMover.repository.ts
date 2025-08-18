import prisma from "../configs/prisma.config";
import { ErrorMessage } from "../constants/ErrorMessage";
import { BadRequestError, MoverProfile } from "../types";
import { Mover, Prisma } from "@prisma/client";

// 기사님 찾기
async function findById(id: Mover["id"]) {
  console.log("=== Repository findById ===");
  console.log("조회하는 기사님 ID:", id);

  const mover = await prisma.mover.findUnique({
    where: { id },
    include: {
      serviceArea: true,
    },
  });

  console.log("조회된 기사님 정보:", {
    id: mover?.id,
    email: mover?.email,
    latitude: mover?.latitude,
    longitude: mover?.longitude,
    businessAddress: mover?.businessAddress,
  });

  return { ...mover, userType: "mover" };
}

// 지역 라벨 > 지역 아이디 찾기 (관계형이라서 string > id로 변환해줘야함)
// TODO: 지역 레포단을 만들 필요는 없을 것 같아서 우선 프로필 레포에 작성함
async function findRegionByLabel(user: MoverProfile) {
  console.log("=== Repository findRegionByLabel ===");
  console.log("검색할 지역 목록:", user.serviceArea);

  const regions = await prisma.region.findMany({
    where: {
      regionName: {
        in: user.serviceArea,
      },
    },
  });

  console.log("매칭된 지역:", regions);
  return regions;
}

// 기사님 프로필 생성/수정
async function modifyMoverProfile(user: MoverProfile, updateData: Prisma.MoverUpdateInput) {
  try {
    console.log("=== 데이터베이스 UPDATE DEBUG ===");
    console.log("Update data being sent to Prisma:", JSON.stringify(updateData, null, 2));
    console.log("위치 정보 특별 확인:", {
      latitude: updateData.latitude,
      longitude: updateData.longitude,
      businessAddress: updateData.businessAddress,
    });

    const modifiedMoverProfile = await prisma.mover.update({
      where: { id: user.userId },
      data: updateData,
      include: {
        serviceArea: true,
      },
    });

    console.log("=== 데이터베이스 UPDATE 완료 ===");
    console.log("업데이트 결과 위치 정보:", {
      id: modifiedMoverProfile.id,
      latitude: modifiedMoverProfile.latitude,
      longitude: modifiedMoverProfile.longitude,
      businessAddress: modifiedMoverProfile.businessAddress,
    });

    // 업데이트 후 다시 조회해서 확인
    const verification = await prisma.mover.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        businessAddress: true,
      },
    });

    console.log("=== 검증 조회 결과 ===");
    console.log("DB에 실제 저장된 위치 정보:", verification);

    return { ...modifiedMoverProfile, userType: "mover" }; // userType은 FE의 header에서 필요
  } catch (error) {
    console.error("❌ 데이터베이스 업데이트 에러:", error);

    // Prisma 에러 상세 정보 출력
    if (error && typeof error === "object" && "code" in error) {
      console.error("Prisma 에러 코드:", (error as any).code);
      console.error("Prisma 에러 메타:", (error as any).meta);
    }

    throw new BadRequestError(ErrorMessage.BAD_REQUEST, error);
  }
}

export default {
  findById,
  findRegionByLabel,
  modifyMoverProfile,
};
