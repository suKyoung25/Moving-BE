import { ErrorMessage } from "../constants/ErrorMessage";
import authClientRepository from "../repositories/authClient.repository";
import { LoginDataLocal, SignUpDataLocal } from "../types";
import { NotFoundError } from "../types/errors";
import { filterSensitiveUserData, hashPassword, verifyPassword } from "../utils/auth.util";
import { generateAccessToken, generateRefreshToken } from "../utils/token.util";

// ✅ 회원가입 - Local
async function create(client: SignUpDataLocal) {
  // 비밀번호 해시
  const hashedPassword = await hashPassword(client.password);

  const newClient = await authClientRepository.create({
    ...client,
    password: hashedPassword,
  });

  // 토큰 넣음
  const accessToken = generateAccessToken({
    userId: newClient.id,
    email: newClient.email,
    name: newClient.name,
    userType: newClient.userType,
  });
  const refreshToken = generateRefreshToken({
    userId: newClient.id,
    email: newClient.email,
    name: newClient.name,
    userType: newClient.userType,
  });

  // 비밀번호와 전화번호 빼고 반환
  const user = filterSensitiveUserData(newClient);
  return { accessToken, refreshToken, user };
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
  const user = filterSensitiveUserData(client);
  return { accessToken, refreshToken, user };
}

const authClientService = { create, loginWithLocal };

export default authClientService;
