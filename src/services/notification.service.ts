import { MoveType, NotificationType } from "@prisma/client";
import { NotificationTemplate } from "../constants/NotificationTemplate";
import notificationRepository from "../repositories/notification.repository";
import { parseRegionKeywords, sendNotificationTo } from "../utils/sse.util";
import cron from "node-cron";
import { addDays, startOfDay } from "date-fns";

interface NotifyMoveDay {
  userId: string;
  content: string;
  role?: "client" | "mover";
}

interface NotifyNewEstimate {
  clientName: string;
  fromAddress: string;
  toAddress: string;
  moveType: MoveType;
  type: NotificationType;
}

// 알림 목록 조회
async function getNotifications(userId: string) {
  return await notificationRepository.getNotifications(userId);
}

// 새로운 견적 요청 알림
async function notifyEstimateRequest({
  clientName,
  fromAddress,
  toAddress,
  moveType,
  type,
}: NotifyNewEstimate) {
  // 주소에서 "서울", "성남", "영등포" 등 지역명 추출
  const fromRegions = parseRegionKeywords(fromAddress);
  const toRegions = parseRegionKeywords(toAddress);
  const targetRegions = Array.from(new Set([...fromRegions, ...toRegions]));

  // 해당 지역에 포함된 기사들 조회
  const movers = await notificationRepository.findMoversByServiceArea(targetRegions);

  const notifications = movers.map((mover) => {
    const content = NotificationTemplate.NEW_ESTIMATE.mover(clientName, moveType);
    const payload = { content, type, role: "mover" };

    sendNotificationTo(mover.id, payload);

    return {
      userId: mover.id,
      content,
      type,
    };
  });

  // DB 저장
  await notificationRepository.createMany(notifications);
}

// 이사 알림
export async function notifyMoveReminder({ userId, content, role }: NotifyMoveDay) {
  const type = "MOVING_DAY";

  await notificationRepository.createNotification({ userId, content, type });

  sendNotificationTo(userId, { content, type, role });
}

cron.schedule("0 7 * * *", async () => {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  const [todayMoves, tomorrowMoves] = await Promise.all([
    notificationRepository.findEstimateByMoveDate(today),
    notificationRepository.findEstimateByMoveDate(tomorrow),
  ]);

  // 당일 이사 알림
  for (const estimate of todayMoves) {
    const content = NotificationTemplate.MOVING_DAY(
      estimate.request.fromAddress,
      estimate.request.toAddress,
      0,
    );
    await notifyMoveReminder({ userId: estimate.clientId, content, role: "client" });
    await notifyMoveReminder({ userId: estimate.moverId, content, role: "mover" });
  }

  // 내일 이사 알림
  for (const estimate of tomorrowMoves) {
    const content = NotificationTemplate.MOVING_DAY(
      estimate.request.fromAddress,
      estimate.request.toAddress,
      1,
    );
    await notifyMoveReminder({ userId: estimate.clientId, content, role: "client" });
    await notifyMoveReminder({ userId: estimate.moverId, content, role: "mover" });
  }
});

export default {
  getNotifications,
  notifyEstimateRequest,
};
