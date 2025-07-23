import { MoveType } from "@prisma/client";

//기사님 프로필 등록할 때 필요한 값 (레포지토리 단)
export type MoverProfile = {
  userId: string;
  email: string;
  image?: string;
  nickName: string;
  career: number;
  introduction: string;
  description: string;
  serviceType: MoveType[];
  serviceArea: string[];
};
