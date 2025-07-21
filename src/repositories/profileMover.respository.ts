/**
 * @file profile.repository.ts
 * @description
 * 프로필 관련 유저 데이터를 다루는 repository 모듈
 */

import { Mover } from "@prisma/client";
import prisma from "../configs/prisma.config";

async function findById(id: Mover["id"]) {
  const mover = await prisma.mover.findUnique({
    where: { id },
    // include: {
    //   livingArea: { select: { regionName: true } },
    // },
  });

  return { ...mover, userType: "mover", isProfileCompleted: false };
}

// //기사님 프로필 생성
// async function saveMoverProfile(user: createMoverProfile) {
//     const existedMover = await prisma.mover.findUnique({
//         where: { email: user.email },
//     });

//todo
// if (existedMover) {
//    const createdMoverProfile = await prisma.mover.update({
//     where:{email: user.email},
//     data: {
//       image: user.image,
//       nickName: user.nickName,
//       career: user.career,
//       introduction: user.introduction,
//       description: user.description,
//       serviceType: user.serviceType,
//         // region
//     },
//   });

//     return { ...createdMoverProfile, userType: "mover" }; //userType은 FE의 header에서 필요
// } else {
//   throw new NotFoundError(ErrorMessage.USER_NOT_FOUND);
// }
// }

export default {
  // saveMoverProfile,
  findById,
};
