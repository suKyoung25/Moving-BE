import { Request } from "express";
import rateLimit from "express-rate-limit";

// 로그인 횟수 제한
export const loginLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30분
  limit: 5,
  message: { message: "5회 이상 로그인에 실패했습니다. 최소 30분 후에 재시도해 주세요." },
  skipSuccessfulRequests: true,
  keyGenerator: (req, res) => {
    return `${req.body.email}`;
  },
});

// (일반유저-프로필 페이지) 비밀번호 재설정 횟수 제한
export const profileUpdateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 한 시간

  limit: (req: Request) => {
    // 비밀번호는 1회, 일반 프로필 수정은 5회까지 허용
    const isPasswordChange = req.body.newPassword && req.body.newPassword.trim() !== "";
    return isPasswordChange ? 3 : 10;
  },

  message: (req: Request) => {
    const isPasswordChange = req.body.newPassword && req.body.newPassword.trim() !== "";
    return {
      message: isPasswordChange
        ? "비밀번호 재설정은 한 시간에 3회만 가능합니다."
        : "프로필 수정은 한 시간에 10회까지만 가능합니다.",
    };
  },

  keyGenerator: (req, res) => {
    const isPasswordChange = req.body.newPassword && req.body.newPassword.trim() !== "";
    const prefix = isPasswordChange ? "password" : "profile";
    return `${prefix}_by_${req.auth?.userId!}`;
  },
});

// (기사님-기본정보수정 페이지) 비밀번호 재설정 횟수 제한
export const basicInfoUpdateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 한 시간

  limit: (req: Request) => {
    // 비밀번호는 3회, 기본정보 수정은 10회까지 허용
    const isPasswordChange = req.body.newPassword && req.body.newPassword.trim() !== "";
    return isPasswordChange ? 3 : 10;
  },

  message: (req: Request) => {
    const isPasswordChange = req.body.newPassword && req.body.newPassword.trim() !== "";
    return {
      message: isPasswordChange
        ? "비밀번호 재설정은 한 시간에 3회만 가능합니다."
        : "기본정보 수정은 한 시간에 10회까지만 가능합니다.",
    };
  },

  keyGenerator: (req, res) => {
    const isPasswordChange = req.body.newPassword && req.body.newPassword.trim() !== "";
    const prefix = isPasswordChange ? "password" : "basicInfo";
    return `${prefix}_by_${req.auth?.userId!}`;
  },
});
