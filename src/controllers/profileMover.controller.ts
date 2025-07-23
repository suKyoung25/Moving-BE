/**
 * @file profile.controller.ts
 * @description
 * - 프로필 관련 HTTP 요청을 처리하는 컨트롤러
 */

import { NextFunction, Request, Response } from "express";
import profileMoverService from "../services/profileMover.service";
import { filterSensitiveUserData } from "../utils/auth.util";
import { MoverProfileDto } from "../dtos/profileClient.dto";

//기사님 프로필 생성
async function moverCreateProfile(
  req: Request<{}, {}, MoverProfileDto>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId } = req.auth!;

    const createdMoverProfile = await profileMoverService.modifyMoverProfile({
      ...req.body,
      userId,
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
  try {
    const { userId } = req.auth!;

    //디버깅
    console.log("ㅏㅑㅡㅏㅏ프론트에서 넘겨준 커리어 career:", req.body.career);
    console.log("ㅏㅑㅡㅏㅏ프론트에서 넘겨준 커리어 career의 타입:", typeof req.body.career);
    console.log("ㅑㅏㅓㅓ프론트에서 넘겨준 서비스타입 serviceType", req.body.serviceType);

    const updatedMoverProfile = await profileMoverService.modifyMoverProfile({
      ...req.body,
      userId,
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
