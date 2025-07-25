import { Client } from "@prisma/client";
import { ClientProfileRegister, ClientProfileUpdate } from "../types";
import profileClientRepository from "../repositories/client.repository";
import { ConflictError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";

async function update(userId: Client["id"], profile: ClientProfileRegister | ClientProfileUpdate) {
  // ✅ 기존 프로필 등록했는지 확인 + 사용자 식별
  const existingProfile = await profileClientRepository.findById(userId);

  // 등록 여부를 따져서
  const isRegistered = existingProfile.isProfileCompleted === true;

  // ✅ 등록 안 했으면 "등록"
  if (!isRegistered) {
    const newProfile = profile as ClientProfileRegister;

    // 나중에 미들웨어로 뺄게요.... 바쁘니까 일단 구현....
    if (!newProfile.serviceType || newProfile.serviceType.length === 0) {
      throw new ConflictError(ErrorMessage.NO_SERVICE_TYPE);
    }

    if (!profile.livingArea || profile.livingArea.length === 0) {
      throw new ConflictError(ErrorMessage.NO_REGION);
    }

    // 반환
    return await profileClientRepository.create(userId, newProfile);
  }

  // ✅ 등록한 경우는 "수정"
  const newProfile = profile as ClientProfileUpdate;
  return await profileClientRepository.update(userId, newProfile);
}

const profileClientService = {
  update,
};

export default profileClientService;
