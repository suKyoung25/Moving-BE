import { z } from "zod";

export const sendEstimateSchema = z.object({
  price: z
    .number()
    .int()
    .positive()
    .max(100_000_000, { message: "1 이상 100,000,000 이하의 숫자만 입력 가능합니다." }),
  comment: z.string().min(10, "10자 이상 입력해 주세요."),
  clientId: z.string().min(1, "clientId는 필수입니다."),
  requestId: z.string().min(1, "requestId는 필수입니다."),
});

export type SendEstimateDto = z.infer<typeof sendEstimateSchema>;

export const rejectEstimateSchema = z.object({
  comment: z.string().min(10, "10자 이상 입력해 주세요."),
  clientId: z.string().min(1, "clientId는 필수입니다."),
  requestId: z.string().min(1, "requestId는 필수입니다."),
});

export type RejectEstimateDto = z.infer<typeof rejectEstimateSchema>;
