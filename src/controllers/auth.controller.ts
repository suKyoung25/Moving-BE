/**
 * @file auth.controller.ts
 * @description
 * - 인증 관련 HTTP 요청을 처리하는 컨트롤러
 * - named export 사용
 *
 */

import { NextFunction, Request, Response } from "express";
import authService from "../services/auth.service";

//아래 코드는 예시입니다.
// export async function signUpController(
//   req: Request<{}, {}, { email: string; password: string }>,
//   res: Response,
//   next: NextFunction
// ) {
//   const { email, password } = req.body;

//   try {
//     const user = await authService.createUser(email, password);
//     res.status(201).json({ user: user });
//   } catch (error) {
//     next(error);
//   }
// }

//기사님 회원가입
export async function moverSignup(
    req: Request<{}, {}, { name: string; email: string; phone: string; password: string }>,
    res: Response,
    next: NextFunction,
) {
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
    req: Request<{}, {}, { email: string; password: string }>,
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
