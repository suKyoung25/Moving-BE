import { z } from "zod";
import { ErrorMessage } from "../constants/ErrorMessage";
import { emailSchema, nameSchema, passwordSchema, phoneSchema } from "./auth.dto";

// ✅ 개별 스키마
export const profileImageSchema = z.string().url().optional();

export const serviceTypeSchema = z
  .array(z.enum(["SMALL", "HOME", "OFFICE"]))
  .min(1, ErrorMessage.NO_SERVICE_TYPE);

export const livingAreaSchema = z
  .array(z.string())
  .min(1, ErrorMessage.NO_REGION)
  .max(5, ErrorMessage.MAX_REGION);

// ✅ 프로필 생성/수정을 함수로 분기처리 함
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
      email: emailSchema.optional(),
      phone: phoneSchema.optional(),
      password: passwordSchema,
      newPassword: passwordSchema.optional(),
      newPasswordConfirmation: z.string().optional().or(z.literal("")),
      profileImage: profileImageSchema,
      serviceType: serviceTypeSchema.optional(),
      livingArea: livingAreaSchema.optional(),
    })
    .refine(
      (data) =>
        !data.newPassword ||
        (data.newPassword && data.newPassword === data.newPasswordConfirmation),
      {
        message: ErrorMessage.NEW_PASSWORD_CONFIRMATION_NOT_MATCH,
        path: ["newPasswordConfirmation"],
      },
    );

  // 반환 처리
  return mode === "create" ? create : update;
}

// ✅ DTO 만듦
export const clientProfileCreateSchema = profileClientSchema("create");
export const clientProfileUpdateSchema = profileClientSchema("update");

export type ClientProfileRegisterDto = z.infer<typeof clientProfileCreateSchema>;
export type ClientProfileUpdateDto = z.infer<typeof clientProfileUpdateSchema>;
