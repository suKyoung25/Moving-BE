import { Request, Response, NextFunction } from "express";
import authClientService from "../services/authClient.service";
import { signInSchema, signUpSchema, SignInRequestDTO, SignUpRequestDTO } from "../dtos/auth.dto";

// ✅ 일반 회원가입
async function signUp(req: Request<{}, {}, SignUpRequestDTO>, res: Response, next: NextFunction) {
  try {
    const client = await authClientService.create(req.body);

    res.status(201).json({ message: "Client 일반 회원가입 성공", data: client });
  } catch (error) {
    next(error);
  }
}

// ✅ 일반 로그인
async function login(req: Request<{}, {}, SignInRequestDTO>, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const loginData = {
      email,
      hashedPassword: password,
    };

    const client = await authClientService.loginWithLocal(loginData);
    res.status(200).json({ message: "Client 일반 로그인 성공", data: client });
  } catch (error) {
    next(error);
  }
}

const authClientController = { signUp, login };

export default authClientController;
