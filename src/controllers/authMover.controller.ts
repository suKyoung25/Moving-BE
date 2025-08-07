import { NextFunction, Request, Response } from "express";
import authMoverService from "../services/authMover.service";
import { SignInRequestDto, SignUpRequestDto } from "../dtos/auth.dto";

// 기사님 회원가입
async function moverSignup(
  req: Request<{}, {}, SignUpRequestDto>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name, email, phone, password } = req.body; // 미들웨어를 통해 유효성 통과된 req.body

    const mover = await authMoverService.createMover({ name, email, phone, password });

    res.status(201).json({ message: "Mover 일반 회원가입 성공", data: mover });
  } catch (error) {
    next(error);
  }
}

// 기사님 로그인
async function moverSignin(
  req: Request<{}, {}, SignInRequestDto>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password } = req.body; // 미들웨어를 통해 유효성 통과된 req.body

    const mover = await authMoverService.setMoverByEmail({ email, password });

    res.status(200).json({ message: "Mover 일반 로그인 성공", data: mover });
  } catch (error) {
    next(error);
  }
}

// 기사님 회원 탈퇴
async function moverWithdraw(
  req: Request<{}, {}, SignInRequestDto>,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth?.userId!;

    await authMoverService.deleteMoverById(userId);

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}

export { moverSignup, moverSignin, moverWithdraw };
