import notificationController from "../controllers/notification.controller";
import { Router } from "express";
import { translationMiddleware } from "../middlewares/translation.middleware";
import { cacheMiddleware, invalidateCache } from "../middlewares/cache.middleware";

const notificationRouter = Router();

// SSE 연결
notificationRouter.get("/stream", cacheMiddleware(), notificationController.sendNotification);

// 알림 조회
notificationRouter.get(
  "/",
  translationMiddleware(["notifications.content"]),
  cacheMiddleware(),
  notificationController.getNotifications,
);

// 알림 읽기
notificationRouter.patch("/:id", invalidateCache(), notificationController.readNotification);

// 모든 알림 읽기
notificationRouter.patch("/", invalidateCache(), notificationController.readAllNotifications);

export default notificationRouter;
