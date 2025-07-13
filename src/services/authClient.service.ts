import { ErrorMessage } from "../constants/ErrorMessage";
import authClientRepository from "../repositories/authClient.repository";
import { ILoginDataLocal, ISignUpDataLocal } from "../types";
import { NotFoundError } from "../types/errors";
import { filterSensitiveUserData, hashPassword, verifyPassword } from "../utils/auth.util";
import { generateAccessToken, generateRefreshToken } from "../utils/token.util";

// ✅ 회원가입 - Local
async function create(
  user: ISignUpDataLocal,
): Promise<Omit<ISignUpDataLocal, "hashedPassword" | "phone">> {
  // 비밀번호 해시
  const hashedPassword = await hashPassword(user.hashedPassword);
  const newClient = await authClientRepository.create({
    ...user,
    hashedPassword,
  });

  // 비밀번호와 전화번호 빼고 반환
  const clientInfo = filterSensitiveUserData(newClient);
  return clientInfo;
}

// ✅ 로그인 - Local
async function loginWithLocal({ email, hashedPassword }: ILoginDataLocal) {
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
