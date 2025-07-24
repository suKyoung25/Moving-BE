import { Router } from "express";
import notificationController from "../controllers/notification.controller";

const NotificationRouter = Router();

// SSE 연결
NotificationRouter.get("/stream", notificationController.sendNotification);

// 알림 조회
NotificationRouter.get("/", notificationController.getNotifications);

// 알림 읽기
// NotificationRouter.patch("/");

export default NotificationRouter;
