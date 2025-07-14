import { MoveType } from "@prisma/client";

//기사님 회원가입할 때 필요한 값 (컨트롤러, 서비스 단)
export type CreateMoverInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

//기사님 회원가입할 때 필요한 값 (레포지토리 단)
export type CreateMoverInputwithHash = {
  name: string;
  email: string;
  phone: string;
  password: string;
  hashedPassword: string;
};

//기사님 로그인할 때 필요한 값 (컨트롤러, 서비스 단)
export type GetMoverInput = {
  email: string;
  password: string;
};

//기사님 프로필 등록할 때 필요한 값 (레포지토리 단)
export type CreateMoverProfile = {
  userId: string;
  email: string;
  image: string;
  nickName: string;
  career: number;
  introduction: string;
  description: string;
  serviceType: MoveType[];
  serviceArea: string[];
};
