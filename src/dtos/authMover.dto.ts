import z from "zod";
import { CreateMoverInput, GetMoverInput } from "../types";
import { ErrorMessage } from "../constants/ErrorMessage";

//기사님 회원가입 DTO
export interface MoverSignupDto extends CreateMoverInput {}

//기사님 로그인 DTO
export interface MoverSigninDto extends GetMoverInput {}

//기사님 회원가입 유효성 검사 //TODO: 일반-회원가입 부분이랑 스키마 통일 시키기
export const signUpMoverSchema = z
  .object({
    email: z.string().email().nonempty(ErrorMessage.NO_EMAIL),

    password: z
      .string()
      .min(8, ErrorMessage.PASSWORD_LENGTH_LIMIT)
      .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, ErrorMessage.PASSWORD_REGEX)
      .nonempty(ErrorMessage.NO_PASSWORD),

    passwordConfirmation: z.string(),

    name: z.string().max(4, ErrorMessage.NAME_LENGTH_LIMIT).nonempty(ErrorMessage.NO_NAME),

    phone: z
      .string()
      .regex(/^\d{9,11}$/, ErrorMessage.PHONE_REGEX)
      .nonempty(ErrorMessage.NO_PHONE),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: ErrorMessage.PASSWORD_CONFIRMATION_NOT_MATCH,
    path: ["passwordConfirmation"],
  });

//기사님 로그인 유효성 검사 //TODO: 일반-로그인 부분이랑 스키마 통일 시키기
export const signInMoverSchema = z.object({
  email: z.string().email().nonempty(ErrorMessage.NO_EMAIL),

  password: z
    .string()
    .min(8, ErrorMessage.PASSWORD_LENGTH_LIMIT)
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, ErrorMessage.PASSWORD_REGEX)
    .nonempty(ErrorMessage.NO_PASSWORD),
});
