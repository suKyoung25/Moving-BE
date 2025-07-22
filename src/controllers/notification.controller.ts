import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../types/errors";
import { addUser, removeUser } from "../utils/sse.util";
import notificationService from "../services/notification.service";

async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const notifications = await notificationService.getNotifications(userId);

    res.json({ message: "알림 조회 성공", notifications });
  } catch (error) {
    next(error);
  }
}

function sendNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      throw new UnauthorizedError();
    }

    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.flushHeaders(); // 헤더 강제 전송

    addUser(userId, res); // 유저 Map에 등록

    req.on("close", () => {
      removeUser(userId); // 연결 종료 시 정리
      res.end();
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getNotifications,
  sendNotification,
};
