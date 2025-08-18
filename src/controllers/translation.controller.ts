import { Request, Response, NextFunction } from "express";
import translationService from "../services/translation.service";
import { getCacheStats, clearCache } from "../utils/cache.util";

/**
 * 단일 텍스트 번역
 */
async function translate(req: Request, res: Response, next: NextFunction) {
  try {
    const { text, targetLang } = req.body;
    if (!text || !targetLang) {
      return res.status(400).json({ message: "text와 targetLang을 모두 입력해야 합니다." });
    }

    const translatedText = await translationService.translateText(text, targetLang);
    res.json({ translatedText });
  } catch (error) {
    next(error);
  }
}

/**
 * 캐시 통계 조회
 */
async function getCacheStatistics(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = getCacheStats();

    res.status(200).json({
      message: "캐시 통계 조회 성공",
      data: {
        memorySize: stats.memorySize,
        redisConnected: stats.redisConnected,
        memoryMaxSize: 1000, // MEMORY_CACHE_SIZE
        cacheTTL: "24시간",
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 캐시 초기화
 */
async function clearTranslationCache(req: Request, res: Response, next: NextFunction) {
  try {
    await clearCache();

    res.status(200).json({
      message: "번역 캐시 초기화 완료",
      data: {
        cleared: true,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
}

export default {
  translate,
  getCacheStatistics,
  clearTranslationCache,
};
