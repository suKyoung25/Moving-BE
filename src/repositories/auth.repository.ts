import { Client } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { SignUpDataSocial } from "../types";

// ✅ 그냥 이메일 찾기
async function findByEmailRaw(email: Client["email"]) {
  return await prisma.client.findUnique({
    where: { email },
  });
}

// ✅ 소셜 로그인
async function save(user: SignUpDataSocial) {
  const newClient = await prisma.client.create({
    data: {
      name: user.name,
      email: user.email!,
      phone: user.phone,
      provider: user.provider,
      providerId: user.providerId,
    },
  });

  return { ...newClient, userType: "client" }; // userType: 헤더에서 씀
}

async function update(id: string, user: Omit<SignUpDataSocial, "email">) {
  const newClient = await prisma.client.update({
    where: { id },
    data: user,
  });

  return { ...newClient, userType: "client" };
}

const authRepository = { findByEmailRaw, save, update };

export default authRepository;
