import { Request, Response, NextFunction } from "express";
import {
  ClientProfileRegisterDto,
  ClientProfileUpdateDto,
  profileClientSchema,
} from "../dtos/client.dto";
import profileClientService from "../services/client.service";
import profileClientRepository from "../repositories/client.repository";

async function update(
  req: Request<{}, {}, ClientProfileRegisterDto>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId } = req.auth!;

    // ✅ 프로필 등록 vs 수정 판단
    const existingProfile = await profileClientRepository.findById(userId);
    const mode = existingProfile?.isProfileCompleted === true ? "update" : "create";

    // ✅ 유형별 parse
    let parsedData;

    if (mode === "create") {
      parsedData = profileClientSchema("create").parse(req.body) as ClientProfileRegisterDto;
    } else {
      parsedData = profileClientSchema("create").parse(req.body) as ClientProfileUpdateDto;
    }

    const newProfile = await profileClientService.update(userId, parsedData);

    // ✅ 반환
    res.status(200).json({
      message: `일반 프로필 ${mode === "create" ? "등록" : "수정"} 성공`,
      data: newProfile,
    });
  } catch (error) {
    next(error);
  }
}

const profileClientController = {
  update,
};

export default profileClientController;
