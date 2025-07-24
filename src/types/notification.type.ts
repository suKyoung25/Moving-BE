import { MoveType, NotificationType } from "@prisma/client";

export interface NotifyInput {
  type: NotificationType;
  targetId: string;
  targetUrl: string;
}
export interface NotifyNewEstimate extends NotifyInput {
  clientName: string;
  fromAddress: string;
  toAddress: string;
  moveType: MoveType;
}

export interface NotifyConfirmEstimate extends NotifyInput {
  userId: string;
  clientName?: string;
  moverName?: string;
}

export interface NotificationPayload {
  userId: string;
  content: string;
  type: NotificationType;
  targetId: string;
  targetUrl: string;
}
