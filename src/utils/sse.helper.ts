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

  const data = `data: ${JSON.stringify(payload)}\n\n`;
  res.write(data);
}
