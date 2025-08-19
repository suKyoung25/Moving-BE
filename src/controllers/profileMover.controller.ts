import { ErrorMessage } from "../constants/ErrorMessage";
import { MoverProfileDto } from "../dtos/mover.dto";
import profileMoverService from "../services/profileMover.service";
import { NotFoundError } from "../types";
import { filterSensitiveUserData } from "../utils/auth.util";
import { NextFunction, Request, Response } from "express";

// 기사님 프로필 수정
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
