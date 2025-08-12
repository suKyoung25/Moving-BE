import { Request, Response, NextFunction } from "express";
import Redis from "ioredis";

// Redis 클라이언트 생성
const redis = new Redis({
  host: process.env.NODE_ENV === "production" ? process.env.REDIS_HOST : "127.0.0.1",
  port: Number(6379),
});

// 연결 상태 모니터링
redis.on("connect", () => console.log("✅ Redis 연결됨"));
redis.on("ready", () => console.log("✅ Redis 준비됨"));
redis.on("error", (err) => console.error("❌ Redis 오류: ", err));

// 캐시 가져오는 조건
const buildKey = (req: Request) => `cache:GET:${req.originalUrl}`;

// 캐싱 미들웨어 함수 (TTL을 매개변수로 받음)
export const cacheMiddleware = (ttl = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // GET만 캐싱
      if (req.method !== "GET") return next();

      // Redis에서 캐시된 데이터 확인
      const cacheKey = buildKey(req);
      const cachedData = await redis.get(cacheKey);
      console.log("cachedData 여부", !!cachedData);

      if (cachedData) {
        // 캐시된 데이터가 있으면 반환
        res.setHeader("X-Cache", "HIT");
        const parsedData = JSON.parse(cachedData);
        return res.status(200).json(parsedData);
      }

      // 캐시된 데이터가 없으면 원본 응답을 캐시하도록 설정
      res.setHeader("X-Cache", "MISS");
      const originalJson = res.json;
      res.json = function (data) {
        // 응답 데이터를 Redis에 캐시 (TTL 설정)
        if (res.statusCode === 200) {
          // 200만 캐싱
          redis.setex(cacheKey, ttl, JSON.stringify(data));
        }

        // 원본 json 메서드 호출
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      // Redis 에러가 발생해도 애플리케이션은 계속 동작하도록 next() 호출
      next();
    }
  };
};

// 캐시 무효화 미들웨어 함수 (특정 URL만 무효화)
export const invalidateCache = (url?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (url) {
        // 특정 URL의 캐시만 삭제
        const cacheKey = `cache:${url}`;
        await redis.del(cacheKey);
        console.log(`Invalidated cache for: ${cacheKey}`);
      } else {
        // 현재 요청 URL의 캐시 삭제
        const cacheKey = `cache:${req.originalUrl}`;
        await redis.del(cacheKey);
        console.log(`Invalidated cache for: ${cacheKey}`);
      }

      next();
    } catch (error) {
      console.error("Cache invalidation error:", error);
      next();
    }
  };
};
