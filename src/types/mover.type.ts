//mover.type.ts
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
  hasDesignatedRequest?: boolean;
  designatedEstimateStatus?: "CONFIRMED" | "REJECTED" | null;
  // 위치 정보 추가
  latitude?: number | null;
  longitude?: number | null;
  businessAddress?: string | null;
  distance?: number; // 검색 위치로부터의 거리(km)
};

export interface MoverDetail extends SimplifiedMover {
  name: string;
  phone: string;
  description: string | null;
  serviceArea: string[];
  createdAt: Date;
  updatedAt: Date;
  // 위치 정보도 포함됨 (SimplifiedMover에서 상속)
}

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
  // 위치 정보 추가
  latitude?: number;
  longitude?: number;
  businessAddress?: string;
};

// API 요청 파라미터에 위치 기반 검색 추가
export interface GetMoversParams {
  page?: number;
  limit?: number;
  search?: string;
  area?: string;
  serviceType?: string;
  sortBy?: string;
  // 위치 기반 검색 파라미터
  latitude?: number;
  longitude?: number;
  radius?: number; // km 단위
}
