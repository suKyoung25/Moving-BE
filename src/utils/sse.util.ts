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

const MoveTypeMap: Record<string, string> = {
  SMALL: "소형이사",
  HOME: "가정이사",
  OFFICE: "사무실이사",
};

export function moveTypeMap(type: string): string {
  return MoveTypeMap[type] ?? "이사";
}

// 주소명 파싱
export function parseRegion(address: string): string {
  if (!address) return "";

  const parts = address.split(" ");
  const sido = parts[0].replace("시", ""); // "서울시" -> "서울"
  const sigungu = parts.find((p) => /[시군구]/.test(p)) || "";

  return `${sido}(${sigungu})`;
}

export function parseRegionKeywords(address: string): string[] {
  if (!address) return [];
  const parts = address.split(" "); // ["경기", "성남시", "분당구", ...]
  return parts
    .slice(0, 3) // 앞 3개까지만 (시/도/구)
    .map((p) => p.replace(/(시|군|구)/g, ""));
}
