/**
 * @file auth.controller.ts
 * @description
 * - 인증 관련 HTTP 요청을 처리하는 컨트롤러
 * - named export 사용
 *
 */

import { NextFunction, Request, Response } from "express";
import authService from "../services/authMover.service";
import { SignInRequestDTO, SignUpRequestDTO } from "../dtos/auth.dto";

//기사님 회원가입
async function moverSingup(
  req: Request<{}, {}, SignUpRequestDTO>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name, email, phone, password } = req.body; //주석: 미들웨어를 통해 유효성 통과된 req.body

    const mover = await authService.createMover({ name, email, phone, password });

    res.status(201).json({ message: "Mover 일반 회원가입 성공", data: mover });
  } catch (error) {
    next(error);
  }
}

//기사님 로그인
async function moverSignin(
  req: Request<{}, {}, SignInRequestDTO>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password } = req.body; //주석: 미들웨어를 통해 유효성 통과된 req.body

    const mover = await authService.setMoverByEmail({ email, password });
    res.status(200).json({ message: "Mover 일반 로그인 성공", data: mover });
  } catch (error) {
    next(error);
  }
}

export { moverSingup, moverSignin };
