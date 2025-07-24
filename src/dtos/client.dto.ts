import { z } from "zod";
import { ErrorMessage } from "../constants/ErrorMessage";
//TODO: client 파일 만들어서 옮길 예정

// 프로필 생성
export const clientProfileSchema = z.object({
  // 주소나 빈 문자열 둘 다 ok
  profileImage: z.string().url().optional(),

  serviceType: z.array(z.enum(["SMALL", "HOME", "OFFICE"])).min(1, ErrorMessage.NO_SERVICE_TYPE),

  livingArea: z.array(z.string()).min(1, ErrorMessage.NO_REGION).max(3, ErrorMessage.MAX_REGION),
});

export type ProfilePostDto = z.infer<typeof clientProfileSchema>;
