import { ErrorMessage } from "../constants/ErrorMessage";
import authClientRepository from "../repositories/authClient.repository";
import {
  BadRequestError,
  LoginDataLocal,
  NotFoundError,
  SignUpDataLocal,
  SignUpDataSocial,
} from "../types";
import { filterSensitiveUserData, hashPassword, verifyPassword } from "../utils/auth.util";
import { generateAccessToken, generateRefreshToken } from "../utils/token.util";

// 회원가입 - Local
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
    isProfileCompleted: newClient?.isProfileCompleted,
  });
  const refreshToken = generateRefreshToken({
    userId: newClient.id,
    email: newClient.email,
    name: newClient.name!,
    userType: newClient.userType,
    isProfileCompleted: newClient?.isProfileCompleted,
  });

  // 비밀번호와 전화번호 빼고 반환
  const user = filterSensitiveUserData(newClient);
  return { accessToken, refreshToken, user };
}

// 로그인 - Local
async function loginWithLocal({ email, hashedPassword }: LoginDataLocal) {
  const client = await authClientRepository.findByEmail(email);

  if (!client) {
    throw new NotFoundError(ErrorMessage.USER_NOT_FOUND);
  }

  // 비밀번호 확인 유효성 검사
  await verifyPassword(hashedPassword, client.hashedPassword!);

  // 토큰 넣음
  const accessToken = generateAccessToken({
    userId: client.id,
    email: client.email,
    name: client.name!,
    userType: client.userType,
    isProfileCompleted: client?.isProfileCompleted,
  });

  const refreshToken = generateRefreshToken({
    userId: client.id,
    email: client.email,
    name: client.name!,
    userType: client.userType,
    isProfileCompleted: client?.isProfileCompleted,
  });

  // 비밀번호와 전화번호 빼고 반환
  const user = filterSensitiveUserData(client);
  return { accessToken, refreshToken, user };
}

//  소셜 로그인
async function oAuthCreateOrUpdate(data: SignUpDataSocial) {
  // 1. 이메일로 사용자가 있는지 찾음
  const { email, ...rest } = data;
  const existingUser = await authClientRepository.findByEmailRaw(email);

  // 2. 이미 가입된 이메일로 또 가입하려 할 때 오류 뱉음 = 소셜끼리
  // ex. 카카오 회원가입 시 네이버 이메일을 썼는데 네이버로 가입하려는 경우
  let user;
  if (existingUser) {
    if (existingUser.provider !== data.provider)
      throw new BadRequestError(`이미 ${existingUser.provider} 가입 시 사용된 이메일입니다.`);

    // + 사용자가 이름을 수정할 수 있게 덮어쓰기 하지 않음
    const { name, ...dataWithoutName } = rest;
    user = await authClientRepository.update(existingUser.id, dataWithoutName);
  } else {
    // 3. 없으면 자료 자체를 새로 생성
    user = await authClientRepository.save(data);
  }

  return filterSensitiveUserData(user);
}

// 회원탈퇴
async function remove(userId: string) {
  return await authClientRepository.removeAccount(userId);
}

export default {
  create,
  loginWithLocal,
  oAuthCreateOrUpdate,
  remove,
};
