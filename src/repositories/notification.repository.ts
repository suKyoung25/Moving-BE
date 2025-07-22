import { NotificationType } from "@prisma/client";
import prisma from "../configs/prisma.config";

interface NotificationInput {
  userId: string;
  content: string;
  type: NotificationType;
}

// 알림 목록 조회
async function getNotifications(userId: string) {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}

// 알림 DB 저장
async function createNotification(data: NotificationInput) {
  return await prisma.notification.create({ data });
}

async function createMany(data: NotificationInput[]) {
  return await prisma.notification.createMany({ data });
}

// 지역 기반 기사 조회
async function findMoversByServiceArea(regions: string[]) {
  return await prisma.mover.findMany({
    where: {
      serviceArea: {
        some: { regionName: { in: regions } },
      },
    },
    select: {
      id: true,
    },
  });
}

// 이사날에 해당하는 견적 찾기 (알림)
async function findEstimateByMoveDate(date: Date) {
  return await prisma.estimate.findMany({
    where: {
      request: {
        moveDate: date,
      },
    },
    include: {
      request: {
        select: {
          fromAddress: true,
          toAddress: true,
        },
      },
    },
  });
}

export default {
  getNotifications,
  createNotification,
  createMany,
  findMoversByServiceArea,
  findEstimateByMoveDate,
};
