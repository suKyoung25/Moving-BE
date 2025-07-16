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

export default {
  patchMoverAccount,
};
