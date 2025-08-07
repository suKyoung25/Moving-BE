// Mock 파일 import
import {
  mockMoversResponse,
  mockMoverDetail,
  mockFavoriteToggleResponse,
} from "../mocks/mover.mock";

import moverService from "./mover.service";
import moverRepository from "../repositories/mover.repository";
import { BadRequestError } from "../types";

jest.mock("../repositories/mover.repository");

describe("Mover Service 테스트", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getMovers 테스트", () => {
    test("정상적인 파라미터로 기사 목록을 조회한다", async () => {
      const params = {
        page: 1,
        limit: 10,
        search: "김기사",
        area: "서울",
        serviceType: "HOME",
        sortBy: "mostReviewed",
      };

      // Mock 파일의 응답 사용
      (moverRepository.fetchMovers as jest.Mock).mockResolvedValue(mockMoversResponse);

      const result = await moverService.getMovers("client-123", params);

      expect(moverRepository.fetchMovers).toHaveBeenCalledWith("client-123", params);
      expect(result).toEqual(mockMoversResponse);
    });

    test("기본 파라미터로 기사 목록을 조회한다", async () => {
      (moverRepository.fetchMovers as jest.Mock).mockResolvedValue(mockMoversResponse);

      const result = await moverService.getMovers();

      expect(moverRepository.fetchMovers).toHaveBeenCalledWith(undefined, {});
      expect(result).toEqual(mockMoversResponse);
    });

    test("page가 1보다 작으면 BadRequestError를 던진다", async () => {
      const params = { page: 0 };

      await expect(moverService.getMovers("client-123", params)).rejects.toThrow(
        new BadRequestError("페이지는 1 이상이어야 합니다."),
      );

      expect(moverRepository.fetchMovers).not.toHaveBeenCalled();
    });

    test("limit이 1보다 작거나 100보다 크면 BadRequestError를 던진다", async () => {
      const params1 = { limit: 0 };
      const params2 = { limit: 101 };

      await expect(moverService.getMovers("client-123", params1)).rejects.toThrow(
        new BadRequestError("limit은 1-100 사이여야 합니다."),
      );

      await expect(moverService.getMovers("client-123", params2)).rejects.toThrow(
        new BadRequestError("limit은 1-100 사이여야 합니다."),
      );

      expect(moverRepository.fetchMovers).not.toHaveBeenCalled();
    });
  });

  describe("getMoverDetail 테스트", () => {
    test("정상적인 moverId로 기사 상세정보를 조회한다", async () => {
      // Mock 파일의 데이터 사용
      (moverRepository.fetchMoverDetail as jest.Mock).mockResolvedValue(mockMoverDetail);

      const result = await moverService.getMoverDetail("mover-1", "client-123");

      expect(moverRepository.fetchMoverDetail).toHaveBeenCalledWith("mover-1", "client-123");
      expect(result).toEqual(mockMoverDetail);
    });

    test("clientId 없이 기사 상세정보를 조회한다", async () => {
      (moverRepository.fetchMoverDetail as jest.Mock).mockResolvedValue(mockMoverDetail);

      const result = await moverService.getMoverDetail("mover-1");

      expect(moverRepository.fetchMoverDetail).toHaveBeenCalledWith("mover-1", undefined);
      expect(result).toEqual(mockMoverDetail);
    });

    test("moverId가 없으면 BadRequestError를 던진다", async () => {
      await expect(moverService.getMoverDetail("")).rejects.toThrow(
        new BadRequestError("moverId가 필요합니다."),
      );

      expect(moverRepository.fetchMoverDetail).not.toHaveBeenCalled();
    });
  });

  describe("toggleFavoriteMover 테스트", () => {
    test("정상적으로 찜을 토글한다", async () => {
      // Mock 파일의 응답 사용
      (moverRepository.toggleFavoriteMover as jest.Mock).mockResolvedValue(
        mockFavoriteToggleResponse,
      );

      const result = await moverService.toggleFavoriteMover("client-123", "mover-1");

      expect(moverRepository.toggleFavoriteMover).toHaveBeenCalledWith("client-123", "mover-1");
      expect(result).toEqual(mockFavoriteToggleResponse);
    });

    test("clientId가 없으면 BadRequestError를 던진다", async () => {
      await expect(moverService.toggleFavoriteMover("", "mover-1")).rejects.toThrow(
        new BadRequestError("clientId 또는 moverId가 필요합니다."),
      );

      expect(moverRepository.toggleFavoriteMover).not.toHaveBeenCalled();
    });

    test("moverId가 없으면 BadRequestError를 던진다", async () => {
      await expect(moverService.toggleFavoriteMover("client-123", "")).rejects.toThrow(
        new BadRequestError("clientId 또는 moverId가 필요합니다."),
      );

      expect(moverRepository.toggleFavoriteMover).not.toHaveBeenCalled();
    });
  });

  describe("getMoverProfile 테스트", () => {
    test("기사님 본인 프로필을 조회한다", async () => {
      // Mock 파일의 데이터 사용
      (moverRepository.fetchMoverDetail as jest.Mock).mockResolvedValue(mockMoverDetail);

      const result = await moverService.getMoverProfile("mover-1");

      expect(moverRepository.fetchMoverDetail).toHaveBeenCalledWith("mover-1");
      expect(result).toEqual(mockMoverDetail);
    });

    test("moverId가 없으면 BadRequestError를 던진다", async () => {
      await expect(moverService.getMoverProfile("")).rejects.toThrow(
        new BadRequestError("moverId가 필요합니다."),
      );

      expect(moverRepository.fetchMoverDetail).not.toHaveBeenCalled();
    });
  });
});
