/**
 * @file profile.controller.ts
 * @description
 * - 프로필 관련 HTTP 요청을 처리하는 컨트롤러
 * - named export 사용
 *
 */

import { NextFunction, Request, Response } from "express";

export async function moverPatchProfile(
  req: Request<{}, {}, { email: string; password: string }>,
  res: Response,
  next: NextFunction
) {
  const { image, nickName, career, introduction, description, serviceType } =
    req.body;

  try {
    const user = await profileService.createUser(email, password);
    res.status(201).json({ user: user });
  } catch (error) {
    next(error);
  }
}
