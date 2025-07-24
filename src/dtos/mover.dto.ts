import { MoveType } from "@prisma/client";
import z from "zod";

//기사님 프로필 관련 사용
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
});

export type MoverProfileDto = z.infer<typeof MoverProfileSchema>;
