import translationService from "../services/translation.service";
import { getCacheStats } from "./cache.util";

// 번역 설정
const BATCH_SIZE = 10; // 한 번에 처리할 텍스트 수
const BATCH_DELAY = 500; // 배치 간 지연 시간 (ms)

/**
 * 지연 함수
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 텍스트를 배치로 나누는 함수
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * 내부에서 사용할 병렬 번역 함수 (texts array 전체 번역) - 배치 처리 포함
 */
async function translateTextsSafeInline(texts: string[], targetLang?: string): Promise<string[]> {
  if (!targetLang) return texts;

  // API 키 상태 확인
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    console.error("[translateTextsSafeInline] DeepL API 키가 설정되지 않았습니다.");
    return texts;
  }

  // 중복 제거 및 매핑
  const uniqueTexts = [...new Set(texts)];
  const textToIndex = new Map<string, number[]>();

  texts.forEach((text, index) => {
    if (!textToIndex.has(text)) {
      textToIndex.set(text, []);
    }
    textToIndex.get(text)!.push(index);
  });

  // 배치로 나누어 처리
  const batches = chunkArray(uniqueTexts, BATCH_SIZE);
  const translatedMap = new Map<string, string>();

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    try {
      const batchStartTime = Date.now();

      const batchResults = await Promise.all(
        batch.map(async (text) => {
          try {
            const startTime = Date.now();
            const translated = await translationService.translateText(text, targetLang);
            const duration = Date.now() - startTime;

            if (translated === text) {
              console.warn(
                `[translateTextsSafeInline] 번역 결과가 원문과 동일합니다: "${text}" -> "${translated}" (${duration}ms)`,
              );
            }

            return { text, translated };
          } catch (e) {
            console.error(
              `[translateTextsSafeInline] 번역 실패 - 텍스트: "${text}", 언어: ${targetLang}, 에러:`,
              e,
            );
            return { text, translated: text }; // 실패 시 원문 반환
          }
        }),
      );

      // 결과를 맵에 저장
      batchResults.forEach(({ text, translated }) => {
        translatedMap.set(text, translated);
      });

      const batchDuration = Date.now() - batchStartTime;

      // 마지막 배치가 아니면 지연
      if (i < batches.length - 1) {
        await delay(BATCH_DELAY);
      }
    } catch (error) {
      console.error(`[translateTextsSafeInline] 배치 ${i + 1} 처리 중 오류:`, error);
      // 배치 실패 시 해당 배치의 모든 텍스트를 원문으로 처리
      batch.forEach((text) => {
        translatedMap.set(text, text);
      });
    }
  }

  // 원래 순서대로 결과 반환
  const result = texts.map((text) => translatedMap.get(text) || text);

  // 캐시 통계 로깅
  const cacheStats = getCacheStats();

  return result;
}

interface ValueItem {
  parent: Record<string, unknown>;
  key: string;
  value: string;
}

/**
 * 경로 문자열로 배열/객체에서 값을 가져와서 번역 후 반영하는 유틸 함수
 * ex) path 'reviews.content' → body.data.reviews[].content
 */
function getValueArrayByPath(obj: unknown, path: string): ValueItem[] {
  const parts = path.split(".");
  let currentRef: unknown = obj;
  const field = parts[parts.length - 1];

  // 마지막 필드 전까지 순차 접근
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];

    if (currentRef === null || currentRef === undefined) {
      return [];
    }

    if (Array.isArray(currentRef)) {
      // 배열인 경우 각 원소에서 다음 경로로 재귀적으로 탐색
      const results: ValueItem[] = [];
      for (const item of currentRef) {
        if (item && typeof item === "object" && part in item) {
          const nextRef = (item as Record<string, unknown>)[part];
          if (i === parts.length - 2) {
            // 마지막 필드 직전이면 값 추출
            if (typeof nextRef === "string" && nextRef.trim() !== "") {
              results.push({
                parent: item as Record<string, unknown>,
                key: field,
                value: nextRef,
              });
            }
          } else {
            // 중간 경로면 계속 탐색
            const subResults = getValueArrayByPath(nextRef, parts.slice(i + 1).join("."));
            results.push(...subResults);
          }
        }
      }
      return results;
    } else if (currentRef && typeof currentRef === "object" && part in currentRef) {
      currentRef = (currentRef as Record<string, unknown>)[part];
    } else {
      return [];
    }
  }

  // 마지막 필드 처리
  if (currentRef && typeof currentRef === "object") {
    if (Array.isArray(currentRef)) {
      return currentRef
        .filter((item) => item && typeof item === "object" && field in item)
        .map((item) => ({
          parent: item as Record<string, unknown>,
          key: field,
          value:
            typeof (item as Record<string, unknown>)[field] === "string"
              ? ((item as Record<string, unknown>)[field] as string)
              : "",
        }))
        .filter((item) => item.value.trim() !== "");
    } else {
      const value = (currentRef as Record<string, unknown>)[field];
      if (typeof value === "string" && value.trim() !== "") {
        return [
          {
            parent: currentRef as Record<string, unknown>,
            key: field,
            value,
          },
        ];
      }
    }
  }

  return [];
}

/**
 * 데이터 객체를 번역하는 유틸리티 함수
 * @param data 번역할 데이터 객체
 * @param paths 번역할 필드 경로 배열 (기본값: ["data.reviews.content"])
 * @param targetLang 대상 언어 코드
 * @returns 번역된 데이터 객체
 */
export async function translateData(
  data: unknown,
  paths: string[] = ["data.reviews.content"],
  targetLang?: string,
): Promise<unknown> {
  if (!targetLang) {
    console.error("[translateData] targetLang이 없어 번역을 건너뜁니다.");
    return data;
  }

  if (!data || typeof data !== "object") {
    console.warn("[translateData] 번역할 데이터가 유효하지 않습니다:", typeof data);
    return data;
  }

  // API 키 상태 확인
  if (!process.env.DEEPL_API_KEY) {
    console.error("[translateData] DeepL API 키가 설정되지 않아 번역을 건너뜁니다.");
    return data;
  }

  const startTime = Date.now();

  try {
    for (const path of paths) {
      if (!path || typeof path !== "string") {
        console.warn("[translateData] 잘못된 경로 무시:", path);
        continue;
      }

      const pathStartTime = Date.now();
      const items = getValueArrayByPath(data, path);

      if (items.length > 0) {
        const texts = items.map((i) => i.value).filter((text) => text && text.trim() !== "");

        if (texts.length > 0) {
          const translated = await translateTextsSafeInline(texts, targetLang);

          let successCount = 0;
          items.forEach((item, idx) => {
            if (
              translated[idx] &&
              translated[idx].trim() !== "" &&
              translated[idx] !== item.value
            ) {
              item.parent[item.key] = translated[idx];
              successCount++;
            }
          });

          const pathDuration = Date.now() - pathStartTime;
        }
      }
    }
  } catch (err) {
    console.error("[translateData] 번역 중 오류:", err);
    // 에러가 발생해도 원본 데이터는 반환
  }

  const totalDuration = Date.now() - startTime;
  return data;
}

/**
 * 단일 텍스트를 번역하는 유틸리티 함수
 * @param text 번역할 텍스트
 * @param targetLang 대상 언어 코드
 * @returns 번역된 텍스트 (실패 시 원문 반환)
 */
export async function translateText(text: string, targetLang?: string): Promise<string> {
  if (!targetLang) return text;

  try {
    return await translationService.translateText(text, targetLang);
  } catch (e) {
    console.error("[translateText] 번역 중 오류:", e);
    return text;
  }
}

/**
 * 텍스트 배열을 병렬로 번역하는 유틸리티 함수
 * @param texts 번역할 텍스트 배열
 * @param targetLang 대상 언어 코드
 * @returns 번역된 텍스트 배열 (실패한 항목은 원문 반환)
 */
export async function translateTexts(texts: string[], targetLang?: string): Promise<string[]> {
  if (!targetLang) return texts;

  return translateTextsSafeInline(texts, targetLang);
}
