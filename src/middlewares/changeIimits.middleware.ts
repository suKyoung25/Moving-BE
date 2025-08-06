import { Request } from "express";
import rateLimit from "express-rate-limit";

// 로그인 횟수 제한
export const loginLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30분
  limit: 5,
  message: { message: "5회 이상 로그인에 실패했습니다. 최소 30분 후에 재시도해 주세요." },
  skipSuccessfulRequests: true,
  keyGenerator: (req, res) => {
    return req.body.email; // 또는 req.ip -- 막는 조건
  },
});

// 비밀번호 재설정 횟수 제한
export const profileUpdateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 한 시간

  limit: (req: Request) => {
    // 비밀번호는 1회, 일반 프로필 수정은 5회까지 허용
    const isPasswordChange = req.body.newPassword && req.body.newPassword.trim() !== "";
    const maxCount = isPasswordChange ? 1 : 5;

    return maxCount;
  },

  message: (req: Request) => {
    const isPasswordChange = req.body.newPassword && req.body.newPassword.trim() !== "";
    return {
      message: isPasswordChange
        ? "비밀번호 재설정은 한 시간에 1회만 가능합니다."
        : "프로필 수정은 한 시간에 5회까지만 가능합니다.",
    };
  },

  keyGenerator: (req, res) => {
    const isPasswordChange = req.body.newPassword && req.body.newPassword.trim() !== "";
    const prefix = isPasswordChange ? "password" : "profile";
    const key = `${prefix}_by_${req.auth?.userId!}`;

    return key;
  },
});
