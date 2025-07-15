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
async function moverSingup(
  req: Request<{}, {}, MoverSignupDto>,
  res: Response,
  next: NextFunction,
) {
  //req.body 유효성 검사
  const parsed = signUpMoverSchema.safeParse(req.body);
  if (!parsed.success) {
    const errorMessages = parsed.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`);
    throw new BadRequestError(errorMessages.join("; "));
  }

  const { name, email, phone, password } = req.body;

  try {
    const mover = await authService.createMover({
      name,
      email,
      phone,
      password,
    });
    res.status(200).json({ mover: mover });
  } catch (error) {
    next(error);
  }
}

//기사님 로그인
async function moverSignin(
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
    res.status(201).json(mover);
  } catch (error) {
    next(error);
  }
}

export { moverSingup, moverSignin };
