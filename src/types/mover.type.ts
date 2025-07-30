import { MoveType } from "@prisma/client";

// TODO: moverType 가능한 부분 병합하거나 extends 사용 부탁드립니다

export type SimplifiedMover = {
  id: string;
  nickName: string | null;
  serviceType: string[]; // 혹은 MoveType[]
  career: number | null;
  averageReviewRating: number;
  reviewCount: number;
  estimateCount: number;
  profileImage: string | null;
  favoriteCount: number;
  isFavorite: boolean;
};

export type MoverDetail = {
  id: string;
  nickName: string | null;
  name: string;
  phone: string;
  profileImage: string | null;
  career: number | null;
  serviceType: string[]; // 혹은 MoveType[]
  serviceArea: string[]; // regionName 목록
  description: string | null;
  averageReviewRating: number;
  reviewCount: number;
  estimateCount: number;
  favoriteCount: number;
  isFavorite: boolean;
};

// 기사님 기본정보 수정 시 필요한 타입 (컨트롤러, 서비스 단)
export type EditMoverAccount = {
  moverId: string;
  name: string;
  email: string;
  phone: string;
  existedPassword?: string;
  newPassword?: string;
};

// 기사님 기본정보 수정 시 필요한 타입 (레포지토리 단)
export type EditMoverAccountWithHash = {
  moverId: string;
  name: string;
  email: string;
  phone: string;
  hashedNewPassword?: string;
};

// 기사님 프로필 등록할 때 필요한 값 (레포지토리 단)
export type MoverProfile = {
  userId: string;
  image?: string;
  nickName: string;
  career: number;
  introduction: string;
  description: string;
  serviceType: MoveType[];
  serviceArea: string[];
};
