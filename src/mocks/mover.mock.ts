// constants/mover.mock.ts

export const mockMoverInfo = {
  id: "mover-123",
  nickName: "김기사",
  name: "김철수",
  phone: "01012345678",
  averageReviewRating: 4.5,
  reviewCount: 25,
  favoriteCount: 10,
  estimateCount: 50,
  career: 5,
  serviceType: ["HOME", "OFFICE"],
  createdAt: new Date("2023-01-01"),
  updatedAt: new Date("2024-01-01"),
};

export const mockServiceArea = [
  { id: "area-1", regionName: "서울" },
  { id: "area-2", regionName: "경기" },
];

export const mockMoverDetail = {
  ...mockMoverInfo,
  serviceArea: ["서울", "경기"],
  isFavorite: false,
  hasDesignatedRequest: false,
  designatedEstimateStatus: null,
};

export const mockMoversResponse = {
  movers: [
    {
      ...mockMoverInfo,
      isFavorite: false,
      hasDesignatedRequest: false,
      designatedEstimateStatus: null,
    },
  ],
  total: 1,
  page: 1,
  limit: 10,
  hasMore: false,
};

export const mockFavoriteToggleResponse = {
  action: "added" as const,
  isFavorite: true,
  favoriteCount: 11,
};

export default {
  mockMoverInfo,
  mockServiceArea,
  mockMoverDetail,
  mockMoversResponse,
  mockFavoriteToggleResponse,
};