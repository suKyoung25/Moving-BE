/**
 * @file profile.repository.ts
 * @description
 * 프로필 관련 유저 데이터를 다루는 repository 모듈
 */

import { Mover } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { createMoverProfile } from "../types/movers";

//기사님 프로필 생성
async function saveMoverProfile(user: createMoverProfile) {
  const createdMover = await prisma.mover.create({
    data: {
      image: user.image,
      nickName: user.nickName,
      career: user.career,
      introduction: user.introduction,
      description: user.description,
      serviceType: user.serviceType,
      //   region
    },
  });

  return { ...createdMover, userType: "mover" }; //userType은 FE의 header에서 필요
}

async function findMoverBynickName(nickName: Mover["nickName"]) {
  return prisma.mover.findUnique({
    where: {
      nickName,
    },
  });
}

async function findMoverByEmail(email: Mover["email"]) {
  const mover = prisma.mover.findUnique({
    where: {
      email,
    },
  });

  return { ...mover, userType: "mover" }; //userType은 FE의 header에서 필요
}

async function findMoverByPhone(phone: Mover["phone"]) {
  return prisma.mover.findUnique({
    where: {
      phone,
    },
  });
}

export default {
  // findByEmail,
  saveMover,
  findMoverBynickName,
  findMoverByEmail,
  findMoverByPhone,
};
