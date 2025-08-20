import * as deepl from "deepl-node";
import "dotenv/config";
import { getCachedTranslation, setCachedTranslation } from "../utils/cache.util";
import { delay } from "../utils/translation.util";

const authKey = process.env.DEEPL_API_KEY!;
const translator = new deepl.Translator(authKey);

// 번역 설정
const TRANSLATION_TIMEOUT = 10000; // 10초
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1초

// 정확한 Case 유지된 허용 코드 배열 (DeepL 타입과 동일)
const allowedCodes: deepl.TargetLanguageCode[] = [
  "bg",
  "cs",
  "da",
  "de",
  "el",
  "en-GB",
  "en-US",
  "es",
  "et",
  "fi",
  "fr",
  "hu",
  "it",
  "ja",
  "lt",
  "lv",
  "nl",
  "pl",
  "pt-PT",
  "pt-BR",
  "ro",
  "ru",
  "sk",
  "sl",
  "sv",
  "tr",
  "zh",
];

/**
 * 정확한 케이스 검증 타입 가드
 */
function isValidTargetLanguageCode(lang: string): lang is deepl.TargetLanguageCode {
  return allowedCodes.includes(lang as deepl.TargetLanguageCode);
}

/**
 * 입력값을 DeepL 공식 코드로 매핑하는 함수 (대소문자 상관없이 변환)
 */
function normalizeTargetLang(lang: string): deepl.TargetLanguageCode | undefined {
  // 소문자 매핑 키: 하이픈 뒤도 소문자.
  // DeepL 공식 타입은 하이픈 뒤 대문자 유지하지만, 실제 API는 소문자 하이픈 뒤 대문자 제외 버전도 허용 가능함.
  const map: Record<string, deepl.TargetLanguageCode> = {
    bg: "bg",
    cs: "cs",
    da: "da",
    de: "de",
    el: "el",
    "en-gb": "en-GB",
    en: "en-US", // en -> en-US
    es: "es",
    et: "et",
    fi: "fi",
    fr: "fr",
    hu: "hu",
    it: "it",
    ja: "ja",
    lt: "lt",
    lv: "lv",
    nl: "nl",
    pl: "pl",
    "pt-pt": "pt-PT",
    "pt-br": "pt-BR",
    ro: "ro",
    ru: "ru",
    sk: "sk",
    sl: "sl",
    sv: "sv",
    tr: "tr",
    zh: "zh",
  };

  return map[lang.toLowerCase()];
}

/**
 * 타임아웃이 있는 Promise 래퍼
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`타임아웃: ${timeoutMs}ms`)), timeoutMs),
    ),
  ]);
}

/**
 * 텍스트를 지정한 언어로 번역하는 함수 (캐싱 및 재시도 로직 포함)
 */
async function translateText(text: string, targetLang?: string): Promise<string> {
  if (!targetLang) {
    return text;
  }

  const normalizedLang = normalizeTargetLang(targetLang);
  if (!normalizedLang || !isValidTargetLanguageCode(normalizedLang)) {
    throw new Error(`지원하지 않는 targetLang 코드입니다: ${targetLang}`);
  }

  // 캐시에서 먼저 확인
  const cachedResult = await getCachedTranslation(text, normalizedLang);
  if (cachedResult) return cachedResult;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const startTime = Date.now();

      const result = await withTimeout(
        translator.translateText(text, null, normalizedLang),
        TRANSLATION_TIMEOUT,
      );

      const duration = Date.now() - startTime;

      // 성공 시 캐시에 저장
      await setCachedTranslation(text, normalizedLang, result.text);

      // 성공 시 로그
      if (duration > 5000) {
        console.warn(
          `[translateText] 느린 번역 감지: ${duration}ms - "${text.substring(0, 50)}..."`,
        );
      }

      return result.text;
    } catch (error) {
      lastError = error as Error;
      console.warn(`[translateText] 번역 시도 ${attempt}/${MAX_RETRIES} 실패:`, error);

      if (attempt < MAX_RETRIES) {
        // 재시도 전 지연
        await delay(RETRY_DELAY * attempt);
      }
    }
  }

  // 모든 재시도 실패
  console.error(`[translateText] 모든 번역 시도 실패 (${MAX_RETRIES}회):`, lastError);
  throw lastError || new Error("번역 실패");
}

export default { translateText };
