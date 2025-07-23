import { z } from "zod";
import { ErrorMessage } from "../constants/ErrorMessage";
import { MoveType } from "@prisma/client";
//TODO: 추후에 파일 이름 profileClient.dto.ts > profile.dto.ts로 바꿀 것

// 프로필 생성
export const clientProfileSchema = z
  .object({
    // 주소나 빈 문자열 둘 다 ok
    profileImage: z.string().url().optional(),

    serviceType: z.array(z.enum(["SMALL", "HOME", "OFFICE"])).optional(),

    livingArea: z.array(z.string()).optional(),
  })
  .refine(
    (data) =>
      data.profileImage ||
      (data.serviceType && data.serviceType.length > 0) ||
      (data.livingArea && data.livingArea.length > 0),
    {
      message: ErrorMessage.NO_CLIENT_PROFILE,
      path: ["profileImage", "serviceType", "livingArea"],
    },
  );

export type ProfilePostDto = z.infer<typeof clientProfileSchema>;

//기사님 프로필 관련 사용
export const MoverProfileSchema = z.object({
  image: z.string().optional(),
  nickName: z.string().min(1, "별명을 입력해주세요."),
  // 디버깅: career: z
  //   .string()
  //   .min(1, "숫자만 입력해주세요.") // 빈 문자열인지 체크 (처음부터 숫자로 하면 빈문자열을 0으로 인식함)
  //   .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
  //     message: "경력은 0 이상이어야 합니다.",
  //   }),
  career: z.coerce.number().min(0, "경력은 0 이상이어야 합니다."),
  introduction: z.string().min(8, "8자 이상 입력해주세요."),
  description: z.string().min(10, "10자 이상 입력해주세요."),
  // 디버깅: serviceType: z.array(z.string().min(1)).min(1, "* 1개 이상 선택해주세요."),
  serviceType: z
    .array(z.nativeEnum(MoveType), {
      invalid_type_error: "서비스 유형이 올바르지 않습니다.",
    })
    .min(1, "* 1개 이상 선택해주세요."),
  serviceArea: z.array(z.string().min(1)).min(1, "* 1개 이상 선택해주세요."),
});

export type MoverProfileDto = z.infer<typeof MoverProfileSchema>;
