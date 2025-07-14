/**
 * @file profile.controller.ts
 * @description
 * - 프로필 관련 HTTP 요청을 처리하는 컨트롤러
 */

import { NextFunction, Request, Response } from "express";
import profileMoverService from "../services/profileMover.service";
import { MoverProfile } from "../dtos/profile.dto";

async function moverCreateProfile(
  req: Request<{}, {}, MoverProfile>,
  res: Response,
  next: NextFunction,
) {
  const { userId } = req.auth!;
  const { email, image, nickName, career, introduction, description, serviceType, serviceArea } =
    req.body;
  try {
    const user = await profileMoverService.createMoverProfile({
      userId,
      email,
      image,
      nickName,
      career,
      introduction,
      description,
      serviceType,
      serviceArea,
    });
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
}

// async function moverPatchProfile(
//   req: Request<{}, {}, { email: string; password: string }>,
//   res: Response,
//   next: NextFunction,
// ) {
//   const { userId } = req.auth;
//   const { image, name, career, introduction, description, serviceType } = req.body;
//   try {
//     const user = await profileService.pathchMover(userId, email, password);
//     res.status(201).json({ user });
//   } catch (error) {
//     next(error);
//   }
// }

export default {
  moverCreateProfile,
};
