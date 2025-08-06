import z from "zod";
import { ErrorMessage } from "../constants/ErrorMessage";

// 일반 회원가입 개별 스키마
export const emailSchema = z.string().email().nonempty(ErrorMessage.NO_EMAIL);

export const passwordSchema = z
  .string()
  .min(8, ErrorMessage.PASSWORD_LENGTH_LIMIT)
  .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, ErrorMessage.PASSWORD_REGEX)
  .nonempty(ErrorMessage.NO_PASSWORD);

export const nameSchema = z
  .string()
  .max(4, ErrorMessage.NAME_LENGTH_LIMIT)
  .nonempty(ErrorMessage.NO_NAME);

export const phoneSchema = z
  .string()
  .regex(/^\d{9,11}$/, ErrorMessage.PHONE_REGEX)
  .nonempty(ErrorMessage.NO_PHONE);

// 일반 회원가입 DTO 및 zod 유효성 검사
export const signUpSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: ErrorMessage.PASSWORD_CONFIRMATION_NOT_MATCH,
    path: ["passwordConfirmation"],
  });

// 일반 로그인 DTO 및 zod 유효성 검사
export const signInSchema = z.object({
  email: z.string().email().nonempty(ErrorMessage.NO_EMAIL),

  password: z
    .string()
    .min(8, ErrorMessage.PASSWORD_LENGTH_LIMIT)
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, ErrorMessage.PASSWORD_REGEX)
    .nonempty(ErrorMessage.NO_PASSWORD),
});

// 일반 회원 탈퇴 DTO 및 zod 유효성 검사
export const deleteUserSchema = z
  .object({
    userId: z.string().optional(),
    password: z.string().optional(), // 기본은 optional로 두고
  })
  .superRefine((data, ctx) => {
    const isLocal = "password" in data;

    if (isLocal) {
      if (!data.password || data.password.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "비밀번호를 입력해주세요.",
        });
      } else {
        const password = data.password;
        if (password.length < 8) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_small,
            path: ["password"],
            type: "string",
            minimum: 8,
            inclusive: true,
            message: ErrorMessage.PASSWORD_LENGTH_LIMIT,
          });
        }
        if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["password"],
            message: ErrorMessage.PASSWORD_REGEX,
          });
        }
      }
    }
  });

export type SignUpRequestDto = z.infer<typeof signUpSchema>;
export type SignInRequestDto = z.infer<typeof signInSchema>;
