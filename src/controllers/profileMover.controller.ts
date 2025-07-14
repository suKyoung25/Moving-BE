/**
 * @file profile.controller.ts
 * @description
 * - 프로필 관련 HTTP 요청을 처리하는 컨트롤러
 */

import { NextFunction, Request, Response } from "express";
import profileMoverService from "../services/profileMover.service";
import { MoverProfileDto } from "../dtos/profile.dto";

//기사님 프로필 생성 (=기사님 모델 정보 추가)
async function moverCreateProfile(
  req: Request<{}, {}, MoverProfileDto>,
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
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

//기사님 프로필 수정(=기사님 모델 정보 수정)
async function moverPatchProfile(
  req: Request<{}, {}, MoverProfileDto>,
  res: Response,
  next: NextFunction,
) {
  const { userId } = req.auth!;
  const { email, image, nickName, career, introduction, description, serviceType, serviceArea } =
    req.body;
  try {
    const user = await profileMoverService.patchMoverProfile({
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
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

export default {
  moverCreateProfile,
  moverPatchProfile,
};
