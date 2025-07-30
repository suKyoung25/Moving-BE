import { ErrorMessage } from "../constants/ErrorMessage";
import authRepository from "../repositories/auth.repository";
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
  await verifyPassword(hashedPassword, client.hashedPassword as string);

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
  const existingUser = await authRepository.findByEmailRaw(email);

  // 2. 이미 존재하는 사용자면 없는 정보 추가: email 넘기는지 여부 확인 필요
  let user;
  if (existingUser) {
    if (existingUser.provider !== data.provider)
      throw new BadRequestError(`이미 ${existingUser.provider}로 가입된 이메일입니다.`);

    // + 사용자가 이름을 수정할 수 있게 덮어쓰기 하지 않음
    const { name, ...dataWithoutName } = rest;
    user = await authClientRepository.update(existingUser.id, dataWithoutName);
  } else {
    // 3. 없으면 자료 자체를 새로 생성
    user = await authClientRepository.save(data);
  }

  return filterSensitiveUserData(user);
}

export default {
  create,
  loginWithLocal,
  oAuthCreateOrUpdate,
};
