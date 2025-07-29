import { Client } from "@prisma/client";
import { ClientProfileRegister, ClientProfileUpdate } from "../types";
import profileClientRepository from "../repositories/client.repository";
import { ConflictError, NotFoundError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";
import { generateAccessToken, generateRefreshToken } from "../utils/token.util";
import authClientRepository from "../repositories/authClient.repository";
import { hashPassword, verifyPassword } from "../utils/auth.util";

async function update(userId: Client["id"], profile: ClientProfileRegister | ClientProfileUpdate) {
  // ✅ 기존 프로필 등록했는지 확인 + 사용자 식별
  const existingProfile = await profileClientRepository.findById(userId);

  // 등록 여부를 따져서
  const isRegistered = existingProfile.isProfileCompleted === true;
  let clientProfile;

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
    clientProfile = await profileClientRepository.create(userId, newProfile);
  } else {
    // ✅ 등록한 경우는 "수정"
    const newProfile = profile as ClientProfileUpdate;

    // ✅ 유효성 검사 시작 ✔️
    const fieldErrors: Record<string, string> = {};

    // 1. 이메일 중복 검사
    if (newProfile.email && newProfile.email !== existingProfile.email) {
      const existingEmail = await authClientRepository.findByEmail(newProfile.email);
      if (existingEmail && existingEmail.id !== userId) {
        fieldErrors.email = ErrorMessage.ALREADY_EXIST_EMAIL;
      }
    }

    // 2. 전화번호 중복 검사
    if (newProfile.phone && newProfile.phone !== existingProfile.phone) {
      const existingPhone = await authClientRepository.findByPhone(newProfile.phone);
      if (existingPhone && existingPhone.id !== userId) {
        fieldErrors.phone = ErrorMessage.ALREADY_EXIST_PHONE;
      }
    }

    // 3. 새 비밀번호 설정 시 현재 비밀번호 검증 ✔️
    if (newProfile.newPassword && newProfile.password) {
      try {
        // 사용자 정보 가져오고
        const userWithPassword = await authClientRepository.findByEmail(existingProfile.email);
        if (!userWithPassword) {
          throw new NotFoundError(ErrorMessage.USER_NOT_FOUND);
        }

        // 현재 비밀번호가 맞는지 확인
        await verifyPassword(newProfile.password, userWithPassword.hashedPassword as string);
      } catch (error) {
        fieldErrors.password = "현재 비밀번호가 일치하지 않습니다.";
      }
    }

    // 4. 오류 투척 ✔️
    if (Object.keys(fieldErrors).length > 0) {
      throw new ConflictError("프로필 수정 유효성 검사 실패", fieldErrors);
    }

    // 5. 새 비밀번호 (있으면) 해싱
    let hashedNewPassword: string | undefined;
    if (newProfile.newPassword) {
      hashedNewPassword = await hashPassword(newProfile.newPassword);
    }

    // 6. 새 비밀번호가 있으면 교체
    const newData = {
      ...newProfile,
      password: hashedNewPassword || undefined, // 새 비밀번호가 있으면 해싱된 것으로 교체
      newPassword: undefined, // DB에 저장하지 않음
      newPasswordConfirmation: undefined, // DB에 저장하지 않음
    };

    // ✔️
    clientProfile = await profileClientRepository.update(userId, newData);
  }

  // 토큰 생성
  const accessToken = generateAccessToken({
    userId: existingProfile.id,
    email: existingProfile.email,
    name: existingProfile.name!,
    userType: existingProfile.userType,
    isProfileCompleted: true,
  });
  const refreshToken = generateRefreshToken({
    userId: existingProfile.id,
    email: existingProfile.email,
    name: existingProfile.name!,
    userType: existingProfile.userType,
    isProfileCompleted: true,
  });

  return { ...clientProfile, accessToken, refreshToken };
}

const profileClientService = {
  update,
};

export default profileClientService;
