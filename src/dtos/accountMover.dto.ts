import z from "zod";
import { ErrorMessage } from "../constants/ErrorMessage";

//기사님 기본정보 수정 입력값 DTO 및 zod 유효성 검사
export const editAccountMoverSchema = z
  .object({
    name: z.string().max(4, ErrorMessage.NAME_LENGTH_LIMIT).nonempty(ErrorMessage.NO_NAME),

    email: z.string().email().nonempty(ErrorMessage.NO_EMAIL),

    phone: z
      .string()
      .regex(/^\d{9,11}$/, ErrorMessage.PHONE_REGEX)
      .nonempty(ErrorMessage.NO_PHONE),

    existedPassword: z
      .string()
      .min(8, ErrorMessage.PASSWORD_LENGTH_LIMIT)
      .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, ErrorMessage.PASSWORD_REGEX)
      .nonempty(ErrorMessage.NO_PASSWORD),

    newPassword: z
      .string()
      .min(8, ErrorMessage.PASSWORD_LENGTH_LIMIT)
      .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, ErrorMessage.PASSWORD_REGEX)
      .nonempty(ErrorMessage.NO_PASSWORD),

    newPasswordConfirmation: z.string(),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: ErrorMessage.PASSWORD_CONFIRMATION_NOT_MATCH,
    path: ["passwordConfirmation"],
  });
