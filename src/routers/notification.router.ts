import { Router } from "express";
import notificationController from "../controllers/notification.controller";

const notificationRouter = Router();

// SSE 연결
notificationRouter.get("/stream", notificationController.sendNotification);

// 알림 조회
notificationRouter.get("/", notificationController.getNotifications);

// 알림 읽기
notificationRouter.patch("/:id", notificationController.readNotification);

export default notificationRouter;
