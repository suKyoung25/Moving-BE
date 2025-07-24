import { MoveType, NotificationType } from "@prisma/client";
import { NotificationTemplate } from "../constants/NotificationTemplate";
import notificationRepository from "../repositories/notification.repository";
import { parseRegionKeywords, sendNotificationTo } from "../utils/sse.util";
import moverRepository from "../repositories/mover.repository";
import { ForbiddenError, NotFoundError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";

interface NotifyInput {
  clientName?: string;
  moverName?: string;
  type: NotificationType;
  targetId: string;
  targetUrl: string;
}
interface NotifyMoveDay {
  userId: string;
  content: string;
  targetId: string;
  targetUrl: string;
}

interface NotifyNewEstimate extends NotifyInput {
  fromAddress: string;
  toAddress: string;
  moveType: MoveType;
}

interface NotifyConfirmEstimate extends NotifyInput {
  userId: string;
}

// 알림 목록 조회
async function getNotifications(userId: string) {
  const [list, hasUnread] = await Promise.all([
    notificationRepository.getNotifications(userId),
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

// 새로운 견적 요청 알림
async function notifyEstimateRequest({
  clientName,
  fromAddress,
  toAddress,
  moveType,
  type,
  targetId,
  targetUrl,
}: NotifyNewEstimate) {
  // 주소에서 "서울", "성남", "영등포" 등 지역명 추출
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
  let content = "";

  if (clientName) {
    content = NotificationTemplate.ESTIMATE_CONFIRMED.mover(clientName);
  } else if (moverName) {
    content = NotificationTemplate.ESTIMATE_CONFIRMED.client(moverName);
  }
  const payload = { content, type, targetId, targetUrl };

  sendNotificationTo(userId, payload);

  const notification = {
    userId,
    content,
    type,
    targetId,
    targetUrl,
  };

  await notificationRepository.createNotification(notification);
}

// 이사 알림
async function notifyMovingDay({ userId, content, targetId, targetUrl }: NotifyMoveDay) {
  const type = NotificationType["MOVING_DAY"];
  const payload = { content, type, targetId, targetUrl };

  sendNotificationTo(userId, payload);

  const notification = {
    userId,
    content,
    type,
    targetId,
    targetUrl,
  };

  await notificationRepository.createNotification(notification);
}

export default {
  getNotifications,
  readNotification,
  notifyEstimateRequest,
  notifyEstimateConfirmed,
  notifyMovingDay,
};
