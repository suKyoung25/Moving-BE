/**
 * @file profile.repository.ts
 * @description
 * 프로필 관련 유저 데이터를 다루는 repository 모듈
 */

import { Mover } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { MoverProfile } from "../types";
import { NotFoundError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";

//기사님 찾기
async function findById(id: Mover["id"]) {
  const mover = await prisma.mover.findUnique({
    where: { id },
  });

  return { ...mover, userType: "mover", isProfileCompleted: false };
}

//기사님 프로필 생성
async function saveMoverProfile(user: MoverProfile) {
  try {
    const createdMoverProfile = await prisma.mover.update({
      where: { email: user.email },
      data: {
        profileImage: user.image,
        nickName: user.nickName,
        career: user.career,
        introduction: user.introduction,
        description: user.description,
        serviceType: user.serviceType,
        serviceArea: {
          set: user.serviceArea.map((regionId) => ({ id: regionId })),
        },
        // isProfileCompleted : "true" //TODO
      },
    });

    return { ...createdMoverProfile, userType: "mover" }; //userType은 FE의 header에서 필요
  } catch {
    throw new NotFoundError(ErrorMessage.USER_NOT_FOUND);
  }
}

export default {
  saveMoverProfile,
  findById,
};
