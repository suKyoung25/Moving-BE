import prisma from "../configs/prisma.config";
import { SignUpDataLocal, SignUpDataSocial } from "../types";
import { Client } from "@prisma/client";

async function findById(id: Client["id"]) {
  return await prisma.client.findUnique({
    where: { id },
  });
}

async function findByEmail(email: Client["email"]) {
  const client = await prisma.client.findUnique({
    where: { email },
  });

  if (!client) return null;
  return { ...client, userType: "client" };
}

async function findByEmailRaw(email: Client["email"]) {
  return await prisma.client.findUnique({
    where: { email },
  });
}

async function findByPhone(phone: Client["phone"]) {
  if (!phone) return null;
  return await prisma.client.findUnique({
    where: { phone },
  });
}

// 회원가입 - Local
async function create(user: SignUpDataLocal) {
  const newClient = await prisma.client.create({
    data: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      hashedPassword: user.password,
    },
  });

  return { ...newClient, userType: "client" }; // userType: 헤더에서 씀
}

// 소셜 로그인
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

async function update(id: string, user: Omit<SignUpDataSocial, "email" | "name">) {
  const newClient = await prisma.client.update({
    where: { id },
    data: user, // 이름은 빼고 받음 (덮어쓰기 방지)
  });

  return { ...newClient, userType: "client" };
}

// 회원탈퇴
async function removeLocalAccount(id: string) {
  return await prisma.client.delete({
    where: { id },
  });
}

export default {
  findById,
  findByEmail,
  findByPhone,
  create,
  save,
  update,
  findByEmailRaw,
  removeLocalAccount,
};
