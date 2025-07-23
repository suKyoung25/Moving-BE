import { moveTypeMap, parseRegion } from "../utils/sse.util";

export const NotificationTemplate = {
  NEW_ESTIMATE: {
    client: (moverName: string, type: string) =>
      `${moverName} 기사님의 <span style="color: #1B92FF;">${moveTypeMap(
        type,
      )} 견적</span>이 도착했어요.`,
    mover: (clientName: string, type: string) =>
      `${clientName} 님의 <span style="color: #1B92FF;">${moveTypeMap(
        type,
      )} 견적 요청</span>이 도착했어요.`,
  },
  ESTIMATE_CONFIRMED: {
    client: (moverName: string) =>
      `${moverName} 기사님의 견적이 <span style="color: #1B92FF;">확정</span>되었어요.`,
    mover: (clientName: string) =>
      `${clientName} 님의 견적이 <span style="color: #1B92FF;">확정</span>되었어요.`,
  },
  MOVING_DAY: (fromAddress: string, toAddress: string, dayOffset: number) => {
    const prefix = dayOffset === 0 ? "오늘은" : dayOffset === 1 ? "내일은" : `${dayOffset}일 후는`;
    const from = parseRegion(fromAddress);
    const to = parseRegion(toAddress);

    return `${prefix} <span style="color: #1B92FF;">${from} → ${to} 이사 예정일</span>이에요.`;
  },
};
