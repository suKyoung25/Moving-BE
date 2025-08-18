import { ErrorMessage } from "../constants/ErrorMessage";
import { MoveType } from "@prisma/client";
import z from "zod";

// 기사님 프로필 관련 사용 - 위치 정보 추가
export const MoverProfileSchema = z.object({
  image: z.string().optional(),
  nickName: z.string().min(1, "별명을 입력해주세요."),
  career: z.coerce.number().min(0, "경력은 0 이상이어야 합니다."),
  introduction: z.string().min(8, "8자 이상 입력해주세요."),
  description: z.string().min(10, "10자 이상 입력해주세요."),
  serviceType: z
    .array(z.nativeEnum(MoveType), {
      invalid_type_error: "서비스 유형이 올바르지 않습니다.",
    })
    .min(1, "* 1개 이상 선택해주세요."),
  serviceArea: z.array(z.string().min(1)).min(1, "* 1개 이상 선택해주세요."),

  // 🆕 위치 정보 필드 추가
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  businessAddress: z.string().optional(),
});

export type MoverProfileDto = z.infer<typeof MoverProfileSchema>;

// 기사님 기본정보 수정 입력값 DTO 및 zod 유효성 검사
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
      .max(16, ErrorMessage.PASSWORD_LENGTH_LIMIT)
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,16}$/,
        ErrorMessage.PASSWORD_REGEX,
      )
      .optional()
      .or(z.literal("")),

    newPassword: z
      .string()
      .min(8, ErrorMessage.PASSWORD_LENGTH_LIMIT)
      .max(16, ErrorMessage.PASSWORD_LENGTH_LIMIT)
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,16}$/,
        ErrorMessage.PASSWORD_REGEX,
      )
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
