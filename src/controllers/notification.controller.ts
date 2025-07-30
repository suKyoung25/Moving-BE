import notificationService from "../services/notification.service";
import { UnauthorizedError } from "../types";
import { addUser, removeUser } from "../utils/sse.util";
import { NextFunction, Request, Response } from "express";

async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const { cursor, limit } = req.query as { cursor?: string; limit?: string };
    const { list, hasUnread } = await notificationService.getNotifications(
      userId,
      cursor,
      Number(limit),
    );

    res.json({
      message: "알림 조회 성공",
      hasUnread,
      nextCursor: list.nextCursor,
      notifications: list.notifications,
    });
  } catch (error) {
    next(error);
  }
}

async function readNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;

    const notification = await notificationService.readNotification(req.params.id, userId);
    res.json({ message: "알림 읽기 성공", notification });
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

    // 주기적으로 ping 전송 (30초 간격)
    const keepAliveInterval = setInterval(() => {
      res.write(":\n\n"); // SSE 주석 형식의 빈 메시지 (무시됨)
    }, 30000);

    addUser(userId, res); // 유저 Map에 등록

    req.on("close", () => {
      clearInterval(keepAliveInterval);
      removeUser(userId); // 연결 종료 시 정리
      res.end();
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getNotifications,
  readNotification,
  sendNotification,
};
