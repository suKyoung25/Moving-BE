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
  });

  return { ...mover, userType: "mover" };
}

//기사님 프로필 생성/수정
async function saveMoverProfile(user: MoverProfile) {
  try {
    //디버깅
    console.log("ㅏㅣㅣ유저 생성 시작");

    //업데이트할 데이터 목록
    const updateData: Prisma.MoverUpdateInput = {
      profileImage: user.image,
      nickName: user.nickName,
      career: user.career,
      introduction: user.introduction,
      description: user.description,
      isProfileCompleted: true,
    };

    //서비스 종류 (enum 타입)
    if (user.serviceType && user.serviceType.length > 0) {
      updateData.serviceType = {
        set: user.serviceType as MoveType[],
      };
    }

    //서비스 지역 (관계형이라서 stirng > id로 변환해줘야함)
    if (user.serviceArea && user.serviceArea.length > 0) {
      const matchedRegions = await prisma.region.findMany({
        where: {
          regionName: {
            in: user.serviceArea,
          },
        },
      });

      if (matchedRegions.length !== user.serviceArea.length) {
        throw new BadRequestError(ErrorMessage.REGION_NOT_FOUND);
      }

      updateData.serviceArea = {
        set: matchedRegions.map((region) => ({ id: region.id })),
      };
    }

    //디버깅
    console.log("ㅏㅣㅣ업데이트할 정보 확인", updateData);

    const createdMoverProfile = await prisma.mover.update({
      where: { id: user.userId },
      data: updateData,
      include: {
        serviceArea: true,
      },
    });

    //디버깅
    console.log("ㅑㅑㅑㅑㅑ생성된 프로필 createdMoverProfile", createdMoverProfile);

    return { ...createdMoverProfile, userType: "mover" }; //userType은 FE의 header에서 필요
  } catch (error) {
    //디버깅
    console.log("ㅏㅜㅜㅜㅑ에러 확인", error);

    throw new BadRequestError(ErrorMessage.BAD_REQUEST, error);
  }
}

//TODO: //기사님 프로필 수정

//     const createdMoverProfile = await prisma.mover.update({
//       where: { id: user.userId },
//       data: {
//         profileImage: user.image,
//         nickName: user.nickName,
//         career: user.career,
//         introduction: user.introduction,
//         description: user.description,
//         serviceType: user.serviceType,
//         serviceArea: {
//           set: user.serviceArea.map((regionId) => ({ id: regionId })),
//         },
//         isProfileCompleted: false, //TODO: 제대로 되는지 확인할 것, 페이지 분기처리
//       },
//     });

export default {
  saveMoverProfile,
  findById,
};
