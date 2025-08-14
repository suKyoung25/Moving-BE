import notificationService from "../services/notification.service";
import { UnauthorizedError } from "../types";
import { addUser, removeUser } from "../utils/sse.helper";
import { NextFunction, Request, Response } from "express";

async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const { cursor, limit } = req.query as { cursor?: string; limit?: string };
    const targetLang = typeof req.query.targetLang === "string" ? req.query.targetLang : undefined;
    const list = await notificationService.getNotifications(userId, cursor, Number(limit), targetLang);

    res.json({
      message: "알림 조회 성공",
      nextCursor: list.nextCursor,
      unreadCount: list.unreadCount,
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

async function readAllNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;

    const result = await notificationService.readAllNotifications(userId);
    res.json({ message: "알림 읽기 성공", updatedCount: result });
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

    // 연결 직후 클라이언트에 초기 이벤트 전송 (연결 확인용)
    res.write(`event: connected\ndata: ${JSON.stringify({ userId })}\n\n`);

    // 주기적으로 ping 전송 (30초 간격, 클라이언트에서 이벤트로 받을 수 있도록)
    const keepAliveInterval = setInterval(() => {
      res.write(`event: ping\ndata: ${Date.now()}\n\n`);
    }, 30000);

    addUser(userId, res); // 유저 Map에 등록

    req.on("close", () => {
      clearInterval(keepAliveInterval);
      removeUser(userId);
      res.end();
    });

    req.on("error", () => {
      clearInterval(keepAliveInterval);
      removeUser(userId);
      res.end();
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getNotifications,
  readNotification,
  readAllNotifications,
  sendNotification,
};
