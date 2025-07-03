/**
 * @file auth.controller.ts
 * @description
 * - 인증 관련 HTTP 요청을 처리하는 컨트롤러
 * - named export 사용
 *
 * 아래 코드는 예시입니다.
 */

import { NextFunction, Request, Response } from "express";
import authService from "../services/auth.service";

export async function signUpController(
  req: Request<{}, {}, { email: string; password: string }>,
  res: Response,
  next: NextFunction
) {
  const { email, password } = req.body;

  try {
    const user = await authService.createUser(email, password);
    res.status(201).json({ user: user });
  } catch (error) {
    next(error);
  }
}
