/**
 * @file profile.repository.ts
 * @description
 * 프로필 관련 유저 데이터를 다루는 repository 모듈
 */

import prisma from "../configs/prisma.config";
import { ErrorMessage } from "../constants/ErrorMessage";
import { BadRequestError, NotFoundError } from "../types/errors";
import { CreateMoverProfile } from "../types";

//기사님 프로필 등록/수정
async function saveMoverProfile(user: CreateMoverProfile) {
  const existedMover = await prisma.mover.findUnique({
    where: { id: user.userId },
  });

  //회원가입 기사님만 프로필 등록 가능
  if (!existedMover) {
    throw new NotFoundError(ErrorMessage.USER_NOT_FOUND);
  } else if (existedMover.nickName) {
    throw new BadRequestError(ErrorMessage.ALREADY_EXIST_PROFILE);
  }

  //존재하는 기사님의 프로필 등록(=첫 수정)
  const createdMoverProfile = await prisma.mover.update({
    where: { id: user.userId },
    data: {
      profileImage: user.image,
      nickName: user.nickName,
      career: user.career,
      introduction: user.introduction,
      description: user.description,
      serviceType: {
        set: user.serviceType, // enum 배열이라 set 사용
      },
      serviceArea: {
        set: user.serviceArea.map((regionName) => ({ regionName })),
      },
    },
  });

  return { ...createdMoverProfile, userType: "mover" }; //userType은 FE의 header에서 필요
}

export default {
  saveMoverProfile,
};
