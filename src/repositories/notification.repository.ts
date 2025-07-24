import { NotificationType } from "@prisma/client";
import prisma from "../configs/prisma.config";

interface NotificationInput {
  userId: string;
  content: string;
  type: NotificationType;
  targetId?: string;
  targetUrl?: string;
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

export default {
  getNotifications,
  createNotification,
  createMany,
};
