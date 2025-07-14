/**
 * @file express.d.ts
 * @description
 * Express의 Request 객체에 사용자 정의 타입을 추가하는 전역 타입 선언 파일
 *
 * - req.auth.userId: JWT 인증 후 사용자 ID를 저장
 * - req.user: Passport 전략에서 주입하는 Prisma User 객체
 */
import { Client as PrismaClientUser } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {

      user?: PrismaClientUser; // Client로 명확히 지정

    }
  }
}

export {};


// import { User as PrismaUser } from "@prisma/client";

// declare global {
//   namespace Express {
//     interface Request {
//       auth: {
//         userId: string;
//       };
//       user?: PrismaUser;
//     }
//   }
// }
// export {};