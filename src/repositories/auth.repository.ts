import { Client } from "@prisma/client";
import prisma from "../configs/prisma.config";

// ✅ 그냥 이메일 찾기
async function findByEmailRaw(email: Client["email"]) {
  return await prisma.client.findUnique({
    where: { email },
  });
}

const authRepository = { findByEmailRaw };

export default authRepository;
