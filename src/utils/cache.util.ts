import Redis from "ioredis";

// 캐시 설정
const CACHE_TTL = 24 * 60 * 60; // 24시간 (초)
const MEMORY_CACHE_SIZE = 1000; // 메모리 캐시 최대 항목 수

// 메모리 캐시 (LRU 방식)
class MemoryCache {
  private cache = new Map<string, { value: string; timestamp: number }>();
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: string): string | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // TTL 체크
    if (Date.now() - item.timestamp > CACHE_TTL * 1000) {
      this.cache.delete(key);
      return null;
    }

    // LRU: 사용된 항목을 맨 뒤로 이동
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.value;
  }

  set(key: string, value: string): void {
    // 캐시 크기 제한 체크
    if (this.cache.size >= this.maxSize) {
      // 가장 오래된 항목 제거 (LRU)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, { value, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Redis 클라이언트 (선택적)
let redisClient: Redis | null = null;

try {
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL);
    console.log("[Cache] Redis 연결 성공");
  }
} catch (error) {
  console.warn("[Cache] Redis 연결 실패, 메모리 캐시만 사용:", error);
}

// 메모리 캐시 인스턴스
const memoryCache = new MemoryCache(MEMORY_CACHE_SIZE);

/**
 * 캐시 키 생성
 */
function generateCacheKey(text: string, targetLang: string): string {
  return `translation:${targetLang}:${Buffer.from(text).toString("base64")}`;
}

/**
 * 캐시에서 번역 결과 조회
 */
export async function getCachedTranslation(
  text: string,
  targetLang: string,
): Promise<string | null> {
  const key = generateCacheKey(text, targetLang);

  try {
    // Redis 캐시 먼저 확인
    if (redisClient) {
      const cached = await redisClient.get(key);
      if (cached) {
        console.log(`[Cache] Redis에서 캐시 히트: "${text.substring(0, 30)}..."`);
        return cached;
      }
    }

    // 메모리 캐시 확인
    const memoryCached = memoryCache.get(key);
    if (memoryCached) {
      console.log(`[Cache] 메모리에서 캐시 히트: "${text.substring(0, 30)}..."`);
      return memoryCached;
    }

    return null;
  } catch (error) {
    console.warn("[Cache] 캐시 조회 중 오류:", error);
    return null;
  }
}

/**
 * 번역 결과를 캐시에 저장
 */
export async function setCachedTranslation(
  text: string,
  targetLang: string,
  translatedText: string,
): Promise<void> {
  const key = generateCacheKey(text, targetLang);

  try {
    // 메모리 캐시에 저장
    memoryCache.set(key, translatedText);

    // Redis 캐시에도 저장 (비동기)
    if (redisClient) {
      await redisClient.setex(key, CACHE_TTL, translatedText);
    }

    console.log(
      `[Cache] 번역 결과 캐시 저장: "${text.substring(0, 30)}..." -> "${translatedText.substring(
        0,
        30,
      )}..."`,
    );
  } catch (error) {
    console.warn("[Cache] 캐시 저장 중 오류:", error);
  }
}

/**
 * 캐시 통계 조회
 */
export function getCacheStats(): { memorySize: number; redisConnected: boolean } {
  return {
    memorySize: memoryCache.size(),
    redisConnected: redisClient !== null,
  };
}

/**
 * 캐시 초기화
 */
export async function clearCache(): Promise<void> {
  memoryCache.clear();

  if (redisClient) {
    try {
      const keys = await redisClient.keys("translation:*");
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (error) {
      console.warn("[Cache] Redis 캐시 초기화 중 오류:", error);
    }
  }

  console.log("[Cache] 모든 캐시가 초기화되었습니다.");
}

/**
 * 캐시 연결 종료
 */
export async function closeCache(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
