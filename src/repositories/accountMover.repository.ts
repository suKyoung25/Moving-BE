/**
 * @file accountMover.repository.ts
 * @description
 * 기사님 기본정보에 관련된 데이터를 다루는 repository 모듈
 */

import prisma from "../configs/prisma.config";
import { EditMoverAccountWithHash } from "../types/account.types";

//기사님 기본 정보 수정
async function patchMoverAccount(patchData: EditMoverAccountWithHash) {
  return await prisma.mover.update({
    where: { id: patchData.moverId },
    data: {
      id: patchData.moverId,
      name: patchData.name,
      email: patchData.email,
      phone: patchData.phone,
      hashedPassword: patchData.hashedNewPassword,
    },
  });
}

//본인을 제외한 데이터가 있는지 확인 (전화번호)
async function findMoverByPhoneExcludingSelf(phone: string, selfId: string) {
  const mover = await prisma.mover.findFirst({
    where: {
      phone,
      NOT: { id: selfId },
    },
  });

  return !!mover; //boolean으로 반환
}

//본인을 제외한 데이터가 있는지 확인(이메일)
async function findMoverByEmailExcludingSelf(email: string, selfId: string) {
  const mover = await prisma.mover.findFirst({
    where: {
      email,
      NOT: { id: selfId },
    },
  });

  return !!mover; //boolean으로 반환
}

export default {
  patchMoverAccount,
  findMoverByPhoneExcludingSelf,
  findMoverByEmailExcludingSelf,
};
