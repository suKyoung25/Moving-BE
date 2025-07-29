import { skip } from "node:test";
import prisma from "../configs/prisma.config";
import { NotificationPayload } from "../types";

// 알림 상세 조회
async function getNotification(notificationId: string) {
  return await prisma.notification.findUnique({
    where: { id: notificationId },
  });
}

// 알림 목록 조회 (무한스크롤)
async function getNotifications({
  userId,
  cursor,
  limit = 6,
}: {
  userId: string;
  cursor?: string;
  limit?: number;
}) {
  const take = Number(limit) || 6;

  const items = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
  });

  const hasNext = items.length > take;
  const notifications = items.slice(0, take);
  const nextCursor = hasNext ? notifications[notifications.length - 1].id : null;

  return { notifications, nextCursor };
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
async function createNotification(data: NotificationPayload) {
  return await prisma.notification.create({ data });
}

// 알림 DB 저장 (다수)
async function createMany(data: NotificationPayload[]) {
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
