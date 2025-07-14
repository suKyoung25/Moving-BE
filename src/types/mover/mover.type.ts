export type SimplifiedMover = {
  id: string;
  nickName: string | null;
  serviceType: string[]; // 혹은 MoveType[]
  career: number | null;
  averageReviewRating: number;
  reviewCount: number;
  estimateCount: number;
  profileImage: string | null;
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
  isFavorite: boolean;
};

