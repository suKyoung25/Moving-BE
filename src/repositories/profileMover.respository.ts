/**
 * @file profile.repository.ts
 * @description
 * 프로필 관련 유저 데이터를 다루는 repository 모듈
 */

import { Mover, MoveType, Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { MoverProfile } from "../types";
import { BadRequestError, NotFoundError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";

//기사님 찾기
async function findById(id: Mover["id"]) {
  const mover = await prisma.mover.findUnique({
    where: { id },
    include: {
      serviceArea: true,
    },
  });

  return { ...mover, userType: "mover" };
}

//기사님 프로필 생성/수정
async function modifyMoverProfile(user: MoverProfile) {
  try {
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
      const matchedRegions = await prisma.region.findMany({
        // (관계형이라서 stirng > id로 변환해줘야함)
        where: {
          regionName: {
            in: user.serviceArea,
          },
        },
      });

      if (matchedRegions.length !== user.serviceArea.length) {
        throw new BadRequestError(ErrorMessage.REGION_NOT_FOUND); // 없는 지역이 경우 에러
      }

      updateData.serviceArea = {
        set: matchedRegions.map((region) => ({ id: region.id })),
      };
    }

    const modifiedMoverProfile = await prisma.mover.update({
      where: { id: user.userId },
      data: updateData,
      include: {
        serviceArea: true,
      },
    });

    return { ...modifiedMoverProfile, userType: "mover" }; //userType은 FE의 header에서 필요
  } catch (error) {
    throw new BadRequestError(ErrorMessage.BAD_REQUEST, error);
  }
}

export default {
  findById,
  modifyMoverProfile,
};
