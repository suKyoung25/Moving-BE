import prisma from "../configs/prisma.config";
import { ErrorMessage } from "../constants/ErrorMessage";
import authClientRepository from "../repositories/authClient.repository";
import { LoginDataLocal, SignUpDataLocal, SignUpDataSocial } from "../types";
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
    name: newClient.name!,
    userType: newClient.userType,
  });
  const refreshToken = generateRefreshToken({
    userId: newClient.id,
    email: newClient.email,
    name: newClient.name!,
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
    name: client.name!,
    userType: client.userType,
  });

  const refreshToken = generateRefreshToken({
    userId: client.id,
    email: client.email,
    name: client.name!,
    userType: client.userType,
  });

  // 비밀번호와 전화번호 빼고 반환
  const user = filterSensitiveUserData(client);
  return { accessToken, refreshToken, user };
}

// ✅ 소셜 로그인

async function oAuthCreateOrUpdate({ provider, providerId, name, email, phone }: SignUpDataSocial) {
  // 1. 이메일로 사용자가 있는지 찾음
  const existingUser = await authClientRepository.findByEmailRaw(email);

  // 2. 이미 존재하는 사용자면 없는 정보 추가
  if (existingUser) {
    return await authClientRepository.update(existingUser.id, {
      provider,
      providerId,
      name,
      email,
      phone,
    });
  }
}
// else {
// 3. 없으면 자료 자체를 새로 생성
//   return await authClientRepository.create({
//     provider,
//     providerId,
//     name,
//     email,
//     phone,
//   });
// }
// }

const authClientService = { create, loginWithLocal, oAuthCreateOrUpdate };

export default authClientService;
