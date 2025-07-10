import { Client } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { ISignUpDataLocal } from "../types";

async function findById(id: Client["id"]): Promise<Client | null> {
  return prisma.client.findUnique({
    where: { id },
  });
}

async function findByEmail(email: Client["email"]): Promise<Client | null> {
  return prisma.client.findUnique({
    where: { email },
  });
}

async function findByPhone(phone: Client["phone"]): Promise<Client | null> {
  return prisma.client.findUnique({
    where: { phone },
  });
}

// ✅ 회원가입 - Local
async function create(user: ISignUpDataLocal) {
  const newClient = await prisma.client.create({
    data: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      hashedPassword: user.hashedPassword!,
    },
  });

  return { ...newClient, userType: "client" }; // userType: 헤더에서 씀
}

const authClientRepository = {
  findById,
  findByEmail,
  findByPhone,
  create,
};

export default authClientRepository;
