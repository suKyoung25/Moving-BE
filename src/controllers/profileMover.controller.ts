/**
 * @file profile.controller.ts
 * @description
 * - 프로필 관련 HTTP 요청을 처리하는 컨트롤러
 */

import { NextFunction, Request, Response } from "express";
import profileMoverService from "../services/profileMover.service";
import { filterSensitiveUserData } from "../utils/auth.util";
import { MoverProfileDto } from "../dtos/mover.dto";
import { NotFoundError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";

// TODO 삭제 예정//기사님 프로필 생성
// async function moverCreateProfile(
//   req: Request<{}, {}, MoverProfileDto>,
//   res: Response,
//   next: NextFunction,
// ) {
//   try {
//     const { userId } = req.auth!;

//     const createdMoverProfile = await profileMoverService.modifyMoverProfile({
//       ...req.body,
//       userId,
//     });
//     const filteredMoverProfile = filterSensitiveUserData(createdMoverProfile);
//     res.status(201).json(filteredMoverProfile);
//   } catch (error) {
//     next(error);
//   }
// }

//기사님 프로필 수정
async function moverPatchProfile(
  req: Request<{}, {}, MoverProfileDto>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId } = req.auth!;

    const updatedMoverProfile = await profileMoverService.modifyMoverProfile({
      ...req.body,
      userId,
    });

    if (!updatedMoverProfile) {
      throw new NotFoundError(ErrorMessage.PROFILE_NOT_FOUND);
    }

    const { accessToken, refreshToken, ...rest } = updatedMoverProfile;

    const filteredMoverProfile = filterSensitiveUserData(rest);
    res.status(200).json({ ...filteredMoverProfile, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
}

export default {
  moverPatchProfile,
};
