import { ErrorMessage } from "../constants/ErrorMessage";
import { z } from "zod";
import { nameSchema, phoneSchema } from "./auth.dto";

// 개별 스키마
export const profileImageSchema = z.string().optional();

export const serviceTypeSchema = z
  .array(z.enum(["SMALL", "HOME", "OFFICE"]))
  .min(1, ErrorMessage.NO_SERVICE_TYPE);

export const livingAreaSchema = z
  .array(z.string())
  .min(1, ErrorMessage.NO_REGION)
  .max(5, ErrorMessage.MAX_REGION);

const passwordSchema = z
  .string()
  .min(8, ErrorMessage.PASSWORD_LENGTH_LIMIT)
  .max(16, ErrorMessage.PASSWORD_LENGTH_LIMIT)
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,16}$/,
    ErrorMessage.PASSWORD_REGEX,
  )
  .optional()
  .or(z.literal(""));
const basicPasswordSchema = z
  .string()
  .min(8, ErrorMessage.PASSWORD_LENGTH_LIMIT)
  .max(16, ErrorMessage.PASSWORD_LENGTH_LIMIT)
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,16}$/,
    ErrorMessage.PASSWORD_REGEX,
  )
  .optional()
  .or(z.literal(""));

// 프로필 생성/수정을 함수로 분기처리 함
export function profileClientSchema(mode: "create" | "update") {
  // 프로필 생성
  const create = z.object({
    profileImage: profileImageSchema,
    serviceType: serviceTypeSchema,
    livingArea: livingAreaSchema,
  });

  // 프로필 수정
  const update = z
    .object({
      name: nameSchema.optional(),
      phone: phoneSchema.optional(),
      password: basicPasswordSchema,
      newPassword: passwordSchema.optional(),
      newPasswordConfirmation: z.string().optional().or(z.literal("")),
      profileImage: profileImageSchema,
      serviceType: serviceTypeSchema.optional(),
      livingArea: livingAreaSchema.optional(),
    })
    .superRefine((data, ctx) => {
      const { newPassword, newPasswordConfirmation } = data;

      // 1. 새 비밀번호를 설정하면 확인도 해야 함
      const eitherPasswordExists = !!newPassword || !!newPasswordConfirmation;

      if (eitherPasswordExists) {
        if (!newPassword || newPassword.length < 8) {
          ctx.addIssue({
            path: ["newPassword"],
            message: "새 비밀번호는 최소 8자리 이상이어야 합니다.",
            code: z.ZodIssueCode.custom,
          });
        }

        // 2. 자릿수 설정
        if (!newPasswordConfirmation || newPasswordConfirmation.length < 8) {
          ctx.addIssue({
            path: ["newPasswordConfirmation"],
            message: "새 비밀번호 확인은 최소 8자리 이상이어야 합니다.",
            code: z.ZodIssueCode.custom,
          });
        }

        // 3. 비밀번호 일치 여부
        if (newPassword && newPasswordConfirmation && newPassword !== newPasswordConfirmation) {
          ctx.addIssue({
            path: ["newPasswordConfirmation"],
            message: "비밀번호가 일치하지 않습니다.",
            code: z.ZodIssueCode.custom,
          });
        }
      }
    });

  // 반환 처리
  return mode === "create" ? create : update;
}

export const clientProfileCreateSchema = profileClientSchema("create");
export const clientProfileUpdateSchema = profileClientSchema("update");

export type ClientProfileRegisterDto = z.infer<typeof clientProfileCreateSchema>;
export type ClientProfileUpdateDto = z.infer<typeof clientProfileUpdateSchema>;
