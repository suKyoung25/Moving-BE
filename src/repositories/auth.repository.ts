/**
 * @file auth.repository.ts
 * @description
 * 인증 관련 유저 데이터를 다루는 repository 모듈
 *
 * service 파일에서 사용 시:
 * import authRepository from "../repositories/auth.repository";
 *
 * const user = await authRepository.findByEmail(email);
 *
 */

import { Mover } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { createMoverInputwithHash } from "../types/mover.type";

// 아래 코드는 예시입니다.
// async function findByEmail(email: Client["email"]) {
//   return prisma.client.findUnique({
//     where: {
//       email,
//     },
//   });
// }

//기사님 생성
async function saveMover(user: createMoverInputwithHash) {
  const createdMover = await prisma.mover.create({
    data: {
      nickName: user.nickName,
      email: user.email,
      phone: user.phone,
      hashedPassword: user.hashedPassword,
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
