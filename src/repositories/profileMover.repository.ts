import prisma from "../configs/prisma.config";
import { ErrorMessage } from "../constants/ErrorMessage";
import { BadRequestError, MoverProfile } from "../types";
import { Mover, Prisma } from "@prisma/client";

// 기사님 찾기
async function findById(id: Mover["id"]) {
  const mover = await prisma.mover.findUnique({
    where: { id },
    include: {
      serviceArea: true,
    },
  });

  return { ...mover, userType: "mover" };
}

// 지역 라벨 > 지역 아이디 찾기 (관계형이라서 stirng > id로 변환해줘야함)
async function findRegionByLabel(user: MoverProfile) {
  return await prisma.region.findMany({
    where: {
      regionName: {
        in: user.serviceArea,
      },
    },
  });
}

// 기사님 프로필 생성/수정
async function modifyMoverProfile(user: MoverProfile, updateData: Prisma.MoverUpdateInput) {
  try {
    const modifiedMoverProfile = await prisma.mover.update({
      where: { id: user.userId },
      data: updateData,
      include: {
        serviceArea: true,
      },
    });

    return { ...modifiedMoverProfile, userType: "mover" }; // userType은 FE의 header에서 필요
  } catch (error) {
    throw new BadRequestError(ErrorMessage.BAD_REQUEST, error);
  }
}

export default {
  findById,
  findRegionByLabel,
  modifyMoverProfile,
};
