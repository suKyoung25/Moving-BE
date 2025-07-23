import { Router } from "express";
import notificationController from "../controllers/notification.controller";

const NotificationRouter = Router();

// 알림 생성
NotificationRouter.post("/stream", notificationController.sendNotification);

// 알림 조회
NotificationRouter.get("/", notificationController.getNotifications);

// 알림 읽기
// NotificationRouter.patch("/");

export default NotificationRouter;
