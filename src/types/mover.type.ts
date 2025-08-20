import { MoveType } from "@prisma/client";

export interface SimplifiedMover {
  id: string;
  nickName: string | null;
  serviceType: string[];
  career: number | null;
  averageReviewRating: number;
  reviewCount: number;
  estimateCount: number;
  profileImage: string | null;
  favoriteCount: number;
  isFavorite: boolean;
  hasDesignatedRequest?: boolean;
  designatedEstimateStatus?: "CONFIRMED" | "REJECTED" | null;
}

export interface MoverDetail extends SimplifiedMover {
  name: string;
  phone: string;
  description: string | null;
  serviceArea: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 기사님 기본정보 수정 (컨트롤러, 서비스)
export interface EditMoverAccount {
  moverId: string;
  name: string;
  email: string;
  phone: string;
  existedPassword?: string;
  newPassword?: string;
}

// 기사님 기본정보 수정 (레포지토리)
export interface EditMoverAccountWithHash {
  moverId: string;
  name: string;
  email: string;
  phone: string;
  hashedNewPassword?: string;
}

// 기사님 프로필 등록 (레포지토리)
export interface MoverProfile {
  userId: string;
  image?: string;
  nickName: string;
  career: number;
  introduction: string;
  description: string;
  serviceType: MoveType[];
  serviceArea: string[];
}

export interface GetMoversParams {
  page?: number;
  limit?: number;
  search?: string;
  area?: string;
  serviceType?: string;
  sortBy?: string;
}

export interface GetMoversResponse {
  movers: SimplifiedMover[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
