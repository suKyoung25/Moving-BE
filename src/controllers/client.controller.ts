import {
  ClientProfileRegisterDto,
  ClientProfileUpdateDto,
  profileClientSchema,
} from "@/dtos/client.dto";
import profileClientRepository from "@/repositories/client.repository";
import profileClientService from "@/services/client.service";
import { Request, Response, NextFunction } from "express";

async function update(
  req: Request<{}, {}, ClientProfileRegisterDto>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId } = req.auth!;

    // 프로필 등록 vs 수정 판단
    const existingProfile = await profileClientRepository.findById(userId);

    const mode = existingProfile?.isProfileCompleted === true ? "update" : "create";

    // 유형별 parse
    let parsedData;

    if (mode === "create") {
      parsedData = profileClientSchema("create").parse(req.body) as ClientProfileRegisterDto;
    } else {
      parsedData = profileClientSchema("update").parse(req.body) as ClientProfileUpdateDto;
    }

    const newProfile = await profileClientService.update(userId, parsedData);

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
