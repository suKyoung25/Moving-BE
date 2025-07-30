import prisma from "@/configs/prisma.config";
import { Client } from "@prisma/client";

// 그냥 이메일 찾기
async function findByEmailRaw(email: Client["email"]) {
  return await prisma.client.findUnique({
    where: { email },
  });
}

export default {
  findByEmailRaw,
};
