import { ErrorMessage } from "../constants/ErrorMessage";
import { NotificationTemplate } from "../constants/NotificationTemplate";
import moverRepository from "../repositories/mover.repository";
import notificationRepository from "../repositories/notification.repository";
import {
  ForbiddenError,
  NotFoundError,
  NotificationPayload,
  NotifyConfirmEstimate,
  NotifyNewEstimate,
  NotifyNewRequest,
} from "../types";
import { parseRegionKeywords } from "../utils/region.util";
import { sendNotificationTo } from "../utils/sse.helper";
import { Estimate, NotificationType } from "@prisma/client";

// 알림 전송 + 저장 함수
async function sendAndSaveNotification({
  userId,
  content,
  type,
  targetId,
  targetUrl,
}: NotificationPayload) {
  const payload = { content, type, targetId, targetUrl };
  sendNotificationTo(userId, payload);
  await notificationRepository.createNotification({ userId, content, type, targetId, targetUrl });
}

// 알림 목록 조회
async function getNotifications(userId: string, cursor?: string, limit?: number) {
  const [list, hasUnread] = await Promise.all([
    notificationRepository.getNotifications({ userId, cursor, limit }),
    notificationRepository.hasUnreadNotifications(userId),
  ]);

  return { list, hasUnread };
}

// 알림 읽기
async function readNotification(notificationId: string, userId: string) {
  const notification = await notificationRepository.getNotification(notificationId);

  if (!notification) {
    throw new NotFoundError(ErrorMessage.NOTIFICATION_NOT_FOUND);
  }
  if (notification.userId !== userId) {
    throw new ForbiddenError(ErrorMessage.FORBIDDEN);
  }

  return await notificationRepository.updateNotification(notificationId);
}

// 새로운 견적 알림
async function notifyEstimate({
  clientId,
  moverName,
  moveType,
  type,
  targetId,
  targetUrl,
}: NotifyNewEstimate) {
  const content = NotificationTemplate.NEW_ESTIMATE.client(moverName, moveType);

  if (!content) return;

  await sendAndSaveNotification({ userId: clientId, content, type, targetId, targetUrl });
}

// 새로운 견적 요청 알림
async function notifyEstimateRequest({
  clientName,
  fromAddress,
  toAddress,
  moveType,
  type,
  targetId,
  targetUrl,
}: NotifyNewRequest) {
  const fromRegions = parseRegionKeywords(fromAddress);
  const toRegions = parseRegionKeywords(toAddress);
  const targetRegions = Array.from(new Set([...fromRegions, ...toRegions]));

  // 해당 지역에 포함된 기사들 조회
  const movers = await moverRepository.findMoversByServiceArea(targetRegions);

  const notifications = movers.map((mover) => {
    const content = NotificationTemplate.NEW_ESTIMATE.mover(clientName!, moveType);
    const payload = { content, type, role: "mover", targetId, targetUrl };

    // SSE 전송
    sendNotificationTo(mover.id, payload);

    return {
      userId: mover.id,
      content,
      type,
      targetId,
      targetUrl,
    };
  });

  // DB 저장
  await notificationRepository.createMany(notifications);
}

// 견적 확정 알림
async function notifyEstimateConfirmed({
  userId,
  clientName,
  moverName,
  type,
  targetId,
  targetUrl,
}: NotifyConfirmEstimate) {
  const content = clientName
    ? NotificationTemplate.ESTIMATE_CONFIRMED.mover(clientName)
    : moverName
    ? NotificationTemplate.ESTIMATE_CONFIRMED.client(moverName)
    : "";

  if (!content) return;

  await sendAndSaveNotification({ userId, content, type, targetId, targetUrl });
}

// 이사 알림
async function notifyMovingDay(estimate: Estimate, content: string) {
  const client = sendAndSaveNotification({
    userId: estimate.clientId,
    content,
    type: NotificationType.MOVING_DAY,
    targetId: estimate.id,
    targetUrl: `/my-quotes/client/${estimate.id}`,
  });

  const mover = sendAndSaveNotification({
    userId: estimate.moverId,
    content,
    type: NotificationType.MOVING_DAY,
    targetId: estimate.id,
    targetUrl: `/my-quotes/mover/${estimate.id}`,
  });

  await Promise.all([client, mover]);
}

export default {
  sendAndSaveNotification,
  getNotifications,
  readNotification,
  notifyEstimate,
  notifyEstimateRequest,
  notifyEstimateConfirmed,
  notifyMovingDay,
};
