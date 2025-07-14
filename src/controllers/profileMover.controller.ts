/**
 * @file profile.controller.ts
 * @description
 * - 프로필 관련 HTTP 요청을 처리하는 컨트롤러
 */

import { NextFunction, Request, Response } from "express";

async function moverCreateProfile(
  req: Request<{}, {}, { email: string; password: string }>,
  res: Response,
  next: NextFunction,
) {
  const { userId } = req.auth;
  const { image, name, career, introduction, description, serviceType } = req.body;
  try {
    const user = await profileService.createMover(userId, email, password);
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
}

async function moverPatchProfile(
  req: Request<{}, {}, { email: string; password: string }>,
  res: Response,
  next: NextFunction,
) {
  const { userId } = req.auth;
  const { image, name, career, introduction, description, serviceType } = req.body;
  try {
    const user = await profileService.pathchMover(userId, email, password);
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
}

export default {
  moverCreateProfile,
  moverPatchProfile,
};
