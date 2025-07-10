import { Client } from "@prisma/client";
import bcrypt from "bcrypt";
import { BadRequestError } from "../types/errors";
import { IToken } from "../types";
import jwt from "jsonwebtoken";

// ✅ 비밀번호 해시
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

// ✅ 사용자 데이터에서 민감한 정보 뺌
export function filterSensitiveUserData(user: Client) {
  const { hashedPassword, phone, ...rest } = user;
  return rest;
}

// ✅ 비밀번호 인증
export async function verifyPassword(inputPassword: string, savedPassword: string) {
  if (!savedPassword) throw new BadRequestError("비밀번호를 입력하지 않았습니다.");

  const isValid = await bcrypt.compare(inputPassword, savedPassword);
  if (!isValid) throw new BadRequestError("비밀번호를 잘못 입력하셨습니다.");
}

// ✅ 토큰 제작
export function generateClientTokens(user: IToken) {
  const payload = {
    id: user.id,
    email: user.email,
    userType: user.userType,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "1h" });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "2w",
  });

  return { accessToken, refreshToken };
}

// ✅ 회원가입 유효성 검사
// export async function validateSignUpData(user: ISignUpDataLocal) {
//     const errors: Partial<Record<keyof ISignUpDataLocal, string>> = {};

//     const existingEmail = await authClientRepository.findByEmail(user.email);
//     const existingPhone = await authClientRepository.findByPhone(user.phone);

//     // 이미 사용 중인 정보
//     if (existingEmail) {
//         errors.email = "이미 사용 중인 이메일입니다.";
//     }

//     if (existingPhone) {
//         errors.phone = "이미 사용 중인 전화번호입니다.";
//     }

//     // 유효성 검사
//     function isValidEmail(email: Client["email"]) {
//         return /^0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z*.[a-zA-Z]{2,3}$/i.test(email);
//     }

//     if (!user.email) {
//         errors.email = "이메일을 입력해 주세요.";
//     } else if (!isValidEmail(user.email)) {
//         errors.email = "올바르지 않은 이메일 형식입니다.";
//     }

//     function isValidPassword(password: string) {
//         return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
//     }

//     if (!user.hashedPassword) {
//         errors.hashedPassword = "비밀번호를 입력해 주세요.";
//     } else if (user.hashedPassword.length < 8) {
//         errors.hashedPassword = "비밀번호는 최소 8자 이상이어야 합니다.";
//     } else if (!isValidPassword(user.hashedPassword)) {
//         errors.hashedPassword = "올바르지 않은 비밀번호 형식입니다.";
//     }

//     if (Object.keys(errors).length > 0) {
//         throw new BadRequestError(`회원가입 실패: ${JSON.stringify(errors)}`);
//     }
// }
