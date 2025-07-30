import z from "zod";
import { ErrorMessage } from "../constants/ErrorMessage";

//기사님 기본정보 수정 입력값 DTO 및 zod 유효성 검사
export const editAccountMoverSchema = z
  .object({
    name: z.string().max(10, ErrorMessage.NAME_LENGTH_LIMIT).nonempty(ErrorMessage.NO_NAME),

    email: z.string().email().nonempty(ErrorMessage.NO_EMAIL),

    phone: z
      .string()
      .regex(/^\d{9,11}$/, ErrorMessage.PHONE_REGEX)
      .nonempty(ErrorMessage.NO_PHONE),

    existedPassword: z
      .string()
      .min(8, ErrorMessage.PASSWORD_LENGTH_LIMIT)
      .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, ErrorMessage.PASSWORD_REGEX)
      .optional()
      .or(z.literal("")),

    newPassword: z
      .string()
      .min(8, ErrorMessage.PASSWORD_LENGTH_LIMIT)
      .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, ErrorMessage.PASSWORD_REGEX)
      .optional()
      .or(z.literal("")),

    newPasswordConfirmation: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const hasNewPassword = !!data.newPassword && data.newPassword !== "";
    const hasConfirmation = !!data.newPasswordConfirmation && data.newPasswordConfirmation !== "";

    if (hasNewPassword || hasConfirmation) {
      // 하나라도 있으면 둘 다 필요
      if (!hasNewPassword || !hasConfirmation) {
        ctx.addIssue({
          code: "custom",
          path: ["newPasswordConfirmation"],
          message: ErrorMessage.CHECK_BOTH_PASSWORD,
        });
      } else if (data.newPassword !== data.newPasswordConfirmation) {
        ctx.addIssue({
          code: "custom",
          path: ["newPasswordConfirmation"],
          message: ErrorMessage.PASSWORD_CONFIRMATION_NOT_MATCH,
        });
      }
    }
  });
