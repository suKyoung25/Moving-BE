import prisma from "../configs/prisma.config";
import { EditMoverAccountWithHash } from "../types";

// 기사님 기본 정보 수정
async function patchMoverAccount(patchData: EditMoverAccountWithHash) {
  // 기본적인 수정 정보
  const updateData: any = {
    name: patchData.name,
    email: patchData.email,
    phone: patchData.phone,
  };

  // newPassword가 있을 때만 hashedPassword 필드 추가
  if (patchData.hashedNewPassword) {
    updateData.hashedPassword = patchData.hashedNewPassword;
  }

  // Prisma 업데이트
  return await prisma.mover.update({
    where: { id: patchData.moverId },
    data: updateData,
  });
}

// 본인을 제외한 데이터가 있는지 확인 (전화번호)
async function findMoverByPhoneExcludingSelf(phone: string, selfId: string) {
  const mover = await prisma.mover.findFirst({
    where: {
      phone,
      NOT: { id: selfId },
    },
  });

  return !!mover;
}

// 본인을 제외한 데이터가 있는지 확인(이메일)
async function findMoverByEmailExcludingSelf(email: string, selfId: string) {
  const mover = await prisma.mover.findFirst({
    where: {
      email,
      NOT: { id: selfId },
    },
  });

  return !!mover;
}

export default {
  patchMoverAccount,
  findMoverByPhoneExcludingSelf,
  findMoverByEmailExcludingSelf,
};
