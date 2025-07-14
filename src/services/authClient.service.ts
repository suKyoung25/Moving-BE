import { ErrorMessage } from "../constants/ErrorMessage";
import authClientRepository from "../repositories/authClient.repository";
import { ILoginDataLocal, ISignUpDataLocal } from "../types";
import { BadRequestError } from "../types/errors";
import {
  filterSensitiveUserData,
  generateClientTokens,
  hashPassword,
  verifyPassword,
} from "../utils/authClient.utils";

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
    throw new BadRequestError(ErrorMessage.USER_NOT_FOUND);
  }

  // 비밀번호 확인 유효성 검사
  await verifyPassword(hashedPassword, client.hashedPassword as string);

  // 토큰 넣음
  const { accessToken, refreshToken } = generateClientTokens({
    id: client.id,
    email: client.email,
    userType: "client",
  });

  // 비밀번호와 전화번호 빼고 반환
  const clientInfo = filterSensitiveUserData(client);
  return { accessToken, refreshToken, clientInfo };
}

const authClientService = { create, loginWithLocal };

export default authClientService;
