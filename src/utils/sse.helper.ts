import { Response } from "express";

const user = new Map<string, Response>();

export function addUser(userId: string, res: Response) {
  user.set(userId, res);
}

export function removeUser(userId: string) {
  user.delete(userId);
}

export function sendNotificationTo(userId: string, payload: any) {
  const res = user.get(userId);
  if (!res) return;

  const event = "notification";
  const data = `event: ${event}\ndata: ${JSON.stringify({
    ...payload,
    createdAt: new Date().toISOString(),
  })}\n\n`;

  try {
    res.write(data);
  } catch (error) {
    removeUser(userId); // 오류 발생 시 연결 정리
  }
}

// SSE 연결 상태 조회 함수들
export function getConnectedUserCount(): number {
  return user.size;
}

export function getConnectedUsers(): string[] {
  return Array.from(user.keys());
}

export function isUserConnected(userId: string): boolean {
  return user.has(userId);
}
