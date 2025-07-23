/**
 * @file profile.controller.ts
 * @description
 * - 프로필 관련 HTTP 요청을 처리하는 컨트롤러
 */

import { NextFunction, Request, Response } from "express";
import profileMoverService from "../services/profileMover.service";
import { MoverProfileDto } from "../dtos/profile.dto";
import { filterSensitiveUserData } from "../utils/auth.util";

//기사님 프로필 생성
async function moverCreateProfile(
  req: Request<{}, {}, MoverProfileDto>,
  res: Response,
  next: NextFunction,
) {
  const { userId } = req.auth!;
  const { email, image, nickName, career, introduction, description, serviceType, serviceArea } =
    req.body;

  try {
    const createdMoverProfile = await profileMoverService.modifyMoverProfile({
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

    const filteredMoverProfile = filterSensitiveUserData(createdMoverProfile);
    res.status(201).json(filteredMoverProfile);
  } catch (error) {
    next(error);
  }
}

//기사님 프로필 수정
async function moverPatchProfile(
  req: Request<{}, {}, MoverProfileDto>,
  res: Response,
  next: NextFunction,
) {
  const { userId } = req.auth!;
  const { email, image, nickName, career, introduction, description, serviceType, serviceArea } =
    req.body;
  try {
    const updatedMoverProfile = await profileMoverService.modifyMoverProfile({
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

    const filteredMoverProfile = filterSensitiveUserData(updatedMoverProfile);
    res.status(200).json(filteredMoverProfile);
  } catch (error) {
    next(error);
  }
}

export default {
  moverCreateProfile,
  moverPatchProfile,
};
