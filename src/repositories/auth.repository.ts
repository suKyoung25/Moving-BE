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
 * 아래 코드는 예시입니다.
 */

import { Client } from "@prisma/client";
import prisma from "../configs/prisma.config";

async function findByEmail(email: Client["email"]) {
  return prisma.client.findUnique({
    where: {
      email,
    },
  });
}

export default {
  findByEmail,
};
