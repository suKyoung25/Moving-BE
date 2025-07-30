import prisma from "../configs/prisma.config";
import { ClientProfileRegister, ClientProfileUpdate } from "../types";
import { filterSensitiveUserData } from "../utils/auth.util";
import { Client, MoveType } from "@prisma/client";

// 사용자 반환 (id로)
async function findById(id: Client["id"]) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      livingArea: { select: { regionName: true } },
    },
  });

  const livingArea = client?.livingArea.map((area) => area.regionName);

  const safeClient = filterSensitiveUserData(client!);

  return { ...safeClient, userType: "client", livingArea };
}

// 프로필 생성
async function create(userId: Client["id"], profile: ClientProfileRegister) {
  // 배열1: serviceType. [user.serviceType]가 안 먹혀서 돌려씀
  const serviceTypes: MoveType[] | undefined = profile.serviceType
    ? profile.serviceType.map((type) => MoveType[type as keyof typeof MoveType])
    : undefined;

  // 배열2: 지역
  const livingAreaName = profile.livingArea
    ? {
        connect: profile.livingArea.map((regionName) => ({
          regionName,
        })),
      }
    : undefined;

  // Client 반환
  const newProfile = await prisma.client.update({
    where: { id: userId }, // 조건: 로그인한 사용자

    data: {
      profileImage: profile.profileImage,
      serviceType: serviceTypes,
      livingArea: livingAreaName,
      isProfileCompleted: true,
    },
  });

  return { ...newProfile, userType: "client" };
}

// 프로필 수정
async function update(userId: Client["id"], profile: ClientProfileUpdate) {
  // 배열1: serviceType
  const serviceTypes: MoveType[] | undefined = profile.serviceType
    ? profile.serviceType.map((type) => MoveType[type as keyof typeof MoveType])
    : undefined;

  // 배열2: 지역
  const livingAreaName = profile.livingArea
    ? {
        set: profile.livingArea.map((regionName) => ({
          regionName,
        })),
      }
    : undefined;

  const newProfile = await prisma.client.update({
    where: { id: userId }, // 조건: 로그인한 사용자22

    data: {
      email: profile.email,
      name: profile.name,
      phone: profile.phone,
      hashedPassword: profile.password,
      profileImage: profile.profileImage,
      serviceType: serviceTypes,
      livingArea: livingAreaName,
    },
  });

  return { ...newProfile, userType: "client" };
}

export default {
  findById,
  create,
  update,
};
