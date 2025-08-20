import { Request, Response, NextFunction } from "express";
import { SignInRequestDto, SignUpRequestDto } from "../dtos/auth.dto";
import authClientService from "../services/authClient.service";

// 일반 회원가입
async function signUp(req: Request<{}, {}, SignUpRequestDto>, res: Response, next: NextFunction) {
  try {
    const client = await authClientService.create(req.body);

    res.status(201).json({ message: "Client 일반 회원가입 성공", data: client });
  } catch (error) {
    next(error);
  }
}

// 일반 로그인
async function login(req: Request<{}, {}, SignInRequestDto>, res: Response, next: NextFunction) {
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

// 회원탈퇴
async function deleteAccount(
  req: Request<{}, {}, SignInRequestDto>,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth?.userId!;

    await authClientService.remove(userId);
    res.status(200).json({ message: "Client 회원탈퇴 성공" });
  } catch (error) {
    next(error);
  }
}

export default {
  signUp,
  login,
  deleteAccount,
};
