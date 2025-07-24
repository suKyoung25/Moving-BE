import { NotificationType } from "@prisma/client";
import prisma from "../configs/prisma.config";

interface NotificationInput {
  userId: string;
  content: string;
  type: NotificationType;
  targetId?: string;
  targetUrl?: string;
}

// 알림 상세 조회
async function getNotification(notificationId: string) {
  return await prisma.notification.findUnique({
    where: { id: notificationId },
  });
}

// 알림 목록 조회
async function getNotifications(userId: string) {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}

// 읽지 않은 알림 여부
async function hasUnreadNotifications(userId: string) {
  const unread = await prisma.notification.findFirst({
    where: {
      userId,
      isRead: false,
    },
    select: { id: true },
  });

  return !!unread;
}

// 알림 상태 업데이트
async function updateNotification(notificationId: string) {
  return await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

// 알림 DB 저장 (1개)
async function createNotification(data: NotificationInput) {
  return await prisma.notification.create({ data });
}

// 알림 DB 저장 (다수)
async function createMany(data: NotificationInput[]) {
  return await prisma.notification.createMany({ data });
}

export default {
  getNotification,
  getNotifications,
  hasUnreadNotifications,
  updateNotification,
  createNotification,
  createMany,
};
