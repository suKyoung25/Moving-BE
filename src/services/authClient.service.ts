import { ErrorMessage } from "../constants/ErrorMessage";
import authClientRepository from "../repositories/authClient.repository";
import { LoginDataLocal, SignUpDataLocal } from "../types";
import { ConflictError, NotFoundError } from "../types/errors";
import { filterSensitiveUserData, hashPassword, verifyPassword } from "../utils/auth.util";
import { generateAccessToken, generateRefreshToken } from "../utils/token.util";

// ✅ 회원가입 - Local
async function create(
  user: SignUpDataLocal,
): Promise<Omit<SignUpDataLocal, "hashedPassword" | "phone">> {
  // 이미 사용한 정보 확인
  const existingEmail = await authClientRepository.findByEmailRaw(user.email);
  const existingPhone = await authClientRepository.findByPhone(user.phone);

  const fieldErrors: Record<string, string> = {};

  if (existingEmail) {
    fieldErrors.email = ErrorMessage.ALREADY_EXIST_EMAIL;
  }
  if (existingPhone) {
    fieldErrors.phone = ErrorMessage.ALREADY_EXIST_PHONE;
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new ConflictError("중복 정보로 인한 회원가입 실패: ", fieldErrors);
  }

  // 비밀번호 해시
  const hashedPassword = await hashPassword(user.hashedPassword);

  console.log("🔐 비밀번호 해시 완료");

  const newClient = await authClientRepository.create({
    ...user,
    hashedPassword,
  });
  console.log("✅ 회원가입 성공:", newClient);

  // 비밀번호와 전화번호 빼고 반환
  const clientInfo = filterSensitiveUserData(newClient);
  return clientInfo;
}

// ✅ 로그인 - Local
async function loginWithLocal({ email, hashedPassword }: LoginDataLocal) {
  const client = await authClientRepository.findByEmail(email);

  if (!client) {
    throw new NotFoundError(ErrorMessage.USER_NOT_FOUND);
  }

  // 비밀번호 확인 유효성 검사
  await verifyPassword(hashedPassword, client.hashedPassword as string);

  // 토큰 넣음
  const accessToken = generateAccessToken({
    userId: client.id,
    email: client.email,
    name: client.name,
    userType: client.userType,
  });

  const refreshToken = generateRefreshToken({
    userId: client.id,
    email: client.email,
    name: client.name,
    userType: client.userType,
  });

  // 비밀번호와 전화번호 빼고 반환
  const clientInfo = filterSensitiveUserData(client);
  return { accessToken, refreshToken, clientInfo };
}

const authClientService = { create, loginWithLocal };

export default authClientService;
