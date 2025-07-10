import { Request, Response, NextFunction } from "express";
import authClientService from "../services/authClient.service";
import { ILoginRequest, ISignUpRequest } from "../types";
import { loginClientSchema, signUpClientSchema } from "../dtos/auth/authClient.dto";

// ✅ 일반 회원가입
export async function clientSignUpController(
  req: Request<{}, {}, ISignUpRequest>,
  res: Response,
  next: NextFunction,
) {
  try {
    // Zod 스키마로 데이터 검증 및 변환
    const parsedData = signUpClientSchema.parse(req.body);

    const signUpData = {
      name: parsedData.name,
      email: parsedData.email,
      phone: parsedData.phoneNumber,
      hashedPassword: parsedData.password,
    };

    const client = await authClientService.create(signUpData);
    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
}

// ✅ 일반 로그인
export async function clientLoginController(
  req: Request<{}, {}, ILoginRequest>,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsedData = loginClientSchema.parse(req.body);

    const loginData = {
      email: parsedData.email,
      hashedPassword: parsedData.password,
    };

    const client = await authClientService.loginWithLocal(loginData);
    res.status(200).json(client);
  } catch (error) {
    next(error);
  }
}
