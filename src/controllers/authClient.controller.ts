import { Request, Response, NextFunction } from "express";
import authClientService from "../services/authClient.service";
import { signinSchema, signUpSchema, SignInRequestDTO, SignUpRequestDTO } from "../dtos/auth.dto";

// ✅ 일반 회원가입
async function signUp(req: Request<{}, {}, SignUpRequestDTO>, res: Response, next: NextFunction) {
  try {
    // Zod 스키마로 데이터 검증 및 변환
    const parsedData = signUpSchema.parse(req.body);

    const signUpData = {
      name: parsedData.name,
      email: parsedData.email,
      phone: parsedData.phone,
      hashedPassword: parsedData.password,
    };

    const client = await authClientService.create(signUpData);

    res.status(201).json({ message: "Client 일반 회원가입 성공", data: client });
  } catch (error) {
    next(error);
  }
}

// ✅ 일반 로그인
async function login(req: Request<{}, {}, SignInRequestDTO>, res: Response, next: NextFunction) {
  try {
    const parsedData = signinSchema.parse(req.body);

    const loginData = {
      email: parsedData.email,
      hashedPassword: parsedData.password,
    };

    const client = await authClientService.loginWithLocal(loginData);
    res.status(200).json({ message: "Client 일반 로그인 성공", data: client });
  } catch (error) {
    next(error);
  }
}

const authClientController = { signUp, login };

export default authClientController;
