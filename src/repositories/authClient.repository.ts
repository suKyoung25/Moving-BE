import { Client } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { ISignUpDataLocal } from "../types";
import { Prisma } from "@prisma/client";
import { ConflictError } from "../types/errors";

async function findById(id: Client["id"]): Promise<Client | null> {
  return prisma.client.findUnique({
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

async function findByPhone(phone: Client["phone"]): Promise<Client | null> {
  return prisma.client.findUnique({
    where: { phone },
  });
}

// ✅ 회원가입 - Local
async function create(user: ISignUpDataLocal) {
  try {
    const newClient = await prisma.client.create({
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        hashedPassword: user.hashedPassword!,
      },
    });

    return { ...newClient, userType: "client" }; // userType: 헤더에서 씀
  } catch (error) {
    console.error("회원가입 시 오류 발생:", error);

    // 오류 생성 시 FE에서 Server Error 오류가 중복으로 터져서 없애는 코드
    // 🔥 보통 오류 처리는 controller, service에서 하지만, DB에서만 알 수 있는 오류(ex. 이메일 중복)는 여기서 써야 함!
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        // P2002: Unique constraint failed
        const target = (error.meta?.target as string[]) || [];
        const duplicateField = target.join(", ");
        throw new ConflictError(`이미 사용 중인 ${duplicateField}입니다.`);
      }
    }
    throw error; // 나머지는 그대로 throw
  }
}

const authClientRepository = {
  findById,
  findByEmail,
  findByPhone,
  create,
};

export default authClientRepository;
