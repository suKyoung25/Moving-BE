/**
 * @file auth.controller.ts
 * @description
 * - 인증 관련 HTTP 요청을 처리하는 컨트롤러
 * - named export 사용
 *
 */

import { NextFunction, Request, Response } from "express";
import authService from "../services/authMover.service";
import { MoverSigninDto, MoverSignupDto, signUpMoverSchema } from "../dtos/auth/authMover.dto";
import { BadRequestError } from "../types/errors";

//기사님 회원가입
export async function moverSignup(
  req: Request<{}, {}, MoverSignupDto>,
  res: Response,
  next: NextFunction,
) {
  //req.body 유효성 검사
  const parsed = signUpMoverSchema.safeParse(req.body);
  if (!parsed.success) {
    const ErrorMessage = Object.values(parsed.error.format())
      .map((field: any) => field._errors.join(", "))
      .join("; ");
    throw new BadRequestError(ErrorMessage); //zod 에러메세지 사용함
  }

  const { name, email, phone, password } = req.body;

  try {
    const mover = await authService.createMover({
      name,
      email,
      phone,
      password,
    });
    res.status(201).json({ mover: mover });
  } catch (error) {
    next(error);
  }
}

//기사님 로그인
export async function moverSignin(
  req: Request<{}, {}, MoverSigninDto>,
  res: Response,
  next: NextFunction,
) {
  const { email, password } = req.body;

  try {
    const mover = await authService.getMoverByEmail({
      email,
      password,
    });
    res.status(201).json({ mover: mover });
  } catch (error) {
    next(error);
  }
}
