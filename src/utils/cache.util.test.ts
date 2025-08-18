import {
  getCachedTranslation,
  setCachedTranslation,
  getCacheStats,
  clearCache,
} from "./cache.util";

// Redis 모킹
jest.mock("ioredis", () => {
  const mockRedis = {
    get: jest.fn(),
    setex: jest.fn(),
    keys: jest.fn(),
    del: jest.fn(),
    quit: jest.fn(),
  };
  return jest.fn(() => mockRedis);
});

describe("CacheUtil", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCachedTranslation", () => {
    test("캐시에 없는 텍스트는 null 반환", async () => {
      const result = await getCachedTranslation("Hello", "ko");
      expect(result).toBeNull();
    });

    test("메모리 캐시에서 결과 반환", async () => {
      // 먼저 캐시에 저장
      await setCachedTranslation("Hello", "ko", "안녕");

      // 캐시에서 조회
      const result = await getCachedTranslation("Hello", "ko");
      expect(result).toBe("안녕");
    });
  });

  describe("setCachedTranslation", () => {
    test("번역 결과를 캐시에 저장", async () => {
      await setCachedTranslation("Hello", "ko", "안녕");

      const result = await getCachedTranslation("Hello", "ko");
      expect(result).toBe("안녕");
    });

    test("다른 언어는 별도로 캐시됨", async () => {
      await setCachedTranslation("Hello", "ko", "안녕");
      await setCachedTranslation("Hello", "ja", "こんにちは");

      const koResult = await getCachedTranslation("Hello", "ko");
      const jaResult = await getCachedTranslation("Hello", "ja");

      expect(koResult).toBe("안녕");
      expect(jaResult).toBe("こんにちは");
    });
  });

  describe("getCacheStats", () => {
    test("캐시 통계 반환", () => {
      const stats = getCacheStats();

      expect(stats).toHaveProperty("memorySize");
      expect(stats).toHaveProperty("redisConnected");
      expect(typeof stats.memorySize).toBe("number");
      expect(typeof stats.redisConnected).toBe("boolean");
    });
  });

  describe("clearCache", () => {
    test("캐시 초기화", async () => {
      // 먼저 캐시에 데이터 저장
      await setCachedTranslation("Hello", "ko", "안녕");

      // 캐시 초기화
      await clearCache();

      // 캐시에서 조회하면 null 반환
      const result = await getCachedTranslation("Hello", "ko");
      expect(result).toBeNull();
    });
  });

  describe("캐시 성능", () => {
    test("캐시 히트 시 빠른 응답", async () => {
      const startTime = Date.now();

      // 첫 번째 요청 (캐시 미스)
      await setCachedTranslation("Test", "ko", "테스트");
      const firstRequestTime = Date.now() - startTime;

      // 두 번째 요청 (캐시 히트)
      const cacheStartTime = Date.now();
      await getCachedTranslation("Test", "ko");
      const cacheRequestTime = Date.now() - cacheStartTime;

      // 캐시 히트가 더 빠름
      expect(cacheRequestTime).toBeLessThan(firstRequestTime);
    });
  });
});
