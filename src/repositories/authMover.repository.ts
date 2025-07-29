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
import { CreateMoverInputwithHash, SignUpDataSocial } from "../types";

//기사님 생성
async function saveMover(user: CreateMoverInputwithHash) {
  const createdMover = await prisma.mover.create({
    data: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      hashedPassword: user.hashedPassword,
    },
  });

  return { ...createdMover, userType: "mover" }; //userType은 FE의 header에서 필요
}

// 아이디로 기사님 조회
async function findMoverById(moverId: string) {
  return await prisma.mover.findUnique({
    where: { id: moverId },
  });
}

//이메일로 기사님 조회
async function getMoverByEmail(email: Mover["email"]) {
  const mover = await prisma.mover.findUnique({
    where: {
      email,
    },
  });

  if (!mover) return null;

  return { ...mover, userType: "mover" }; //userType은 FE의 header에서 필요
}

//전화번호로 기사님 조회
async function getMoverByPhone(phone: Mover["phone"]) {
  if (!phone) return null;
  return await prisma.mover.findUnique({
    where: {
      phone,
    },
  });
}

//기사님 소셜 인증
async function createOrUpdate(data: SignUpDataSocial) {
  return prisma.mover.upsert({
    where: {
      provider_providerId: {
        provider: data.provider,
        providerId: data.providerId,
      },
    },
    update: { email: data.email, name: data.name },
    create: {
      provider: data.provider,
      providerId: data.providerId,
      email: data.email,
      name: data.name,
      phone: data.phone,
    },
  });
}

export default {
  saveMover,
  findMoverById,
  getMoverByEmail,
  getMoverByPhone,
  createOrUpdate,
};
