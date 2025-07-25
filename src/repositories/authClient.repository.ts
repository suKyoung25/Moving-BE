import { Client } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { SignUpDataLocal, SignUpDataSocial } from "../types";

async function findById(id: Client["id"]) {
  return await prisma.client.findUnique({
    where: { id },
  });
}

async function findByEmailRaw(email: Client["email"]) {
  return await prisma.client.findUnique({
    where: { email },
  });
}

async function findByEmail(email: Client["email"]) {
  const client = await prisma.client.findUnique({
    where: { email },
  });

  if (!client) return null;
  return { ...client, userType: "client" };
}

async function findByPhone(phone: Client["phone"]) {
  if (!phone) return null;
  return await prisma.client.findUnique({
    where: { phone },
  });
}

// ✅ 회원가입 - Local
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

// ✅ 소셜 로그인
async function update(id: string, data: SignUpDataSocial) {
  return prisma.client.update({
    where: { id },
    data: data,
  });
}

async function createOrUpdate({ provider, providerId, email, name, phone }: SignUpDataSocial) {
  return prisma.client.upsert({
    where: { provider_providerId: { provider, providerId } },
    update: { email, name, phone },
    create: { provider, providerId, email, name, phone },
  });
}

const authClientRepository = {
  findById,
  findByEmailRaw,
  findByEmail,
  findByPhone,
  create,
  update,
  createOrUpdate,
};

export default authClientRepository;
