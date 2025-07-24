import cron from "node-cron";
import estimateRepository from "../repositories/estimate.repository";
import { NotificationTemplate } from "../constants/NotificationTemplate";
import notificationService from "../services/notification.service";
import { addDays, startOfDay } from "date-fns";
import { NotificationType } from "@prisma/client";

cron.schedule("0 7 * * *", async () => {
  console.log("🕖 Running moving day notification at 7AM");
  const now = new Date();
  const today = startOfDay(now); // UTC 기준 오늘 00:00:00
  const tomorrow = addDays(today, 1);
  const dayAftertomorrow = addDays(today, 2);

  const [todayMoves, tomorrowMoves] = await Promise.all([
    estimateRepository.findEstimateByMoveDate(today, tomorrow),
    estimateRepository.findEstimateByMoveDate(tomorrow, dayAftertomorrow),
  ]);

  // 당일 이사 알림
  for (const estimate of todayMoves) {
    const content = NotificationTemplate.MOVING_DAY(
      estimate.request.fromAddress,
      estimate.request.toAddress,
      0,
    );
    await notificationService.sendAndSaveNotification({
      userId: estimate.clientId,
      content,
      type: NotificationType.MOVING_DAY,
      targetId: estimate.id,
      targetUrl: `/my-quotes/client/${estimate.id}`,
    });
    await notificationService.sendAndSaveNotification({
      userId: estimate.moverId,
      content,
      type: NotificationType.MOVING_DAY,
      targetId: estimate.id,
      targetUrl: `/my-quotes/mover/${estimate.id}`,
    });
  }

  // 내일 이사 알림
  for (const estimate of tomorrowMoves) {
    const content = NotificationTemplate.MOVING_DAY(
      estimate.request.fromAddress,
      estimate.request.toAddress,
      1,
    );
    await notificationService.sendAndSaveNotification({
      userId: estimate.clientId,
      content,
      type: NotificationType.MOVING_DAY,
      targetId: estimate.id,
      targetUrl: `/my-quotes/client/${estimate.id}`,
    });
    await notificationService.sendAndSaveNotification({
      userId: estimate.moverId,
      content,
      type: NotificationType.MOVING_DAY,
      targetId: estimate.id,
      targetUrl: `/my-quotes/mover/${estimate.id}`,
    });
  }
});
