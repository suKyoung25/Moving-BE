/**
 * @file express.d.ts
 * @description
 * Express의 Request 객체에 사용자 정의 타입을 추가하는 전역 타입 선언 파일
 *
 * - req.auth.userId: JWT 인증 후 사용자 ID를 저장
 * - req.user: Passport 전략에서 주입하는 Prisma User 객체
 */

import { Client, Mover } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        userType: "client" | "mover";
      };
      user?: Client | Mover;
    }
  }
}
export {};
