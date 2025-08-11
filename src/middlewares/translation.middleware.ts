import { Request, Response, NextFunction } from "express";
import translationService from "../services/translation.service";

/**
 * 내부에서 사용할 병렬 번역 함수 (texts array 전체 번역)
 */
async function translateTextsSafeInline(texts: string[], targetLang?: string): Promise<string[]> {
  if (!targetLang) return texts;
  return Promise.all(
    texts.map(async (text) => {
      try {
        return await translationService.translateText(text, targetLang);
      } catch (e) {
        // 번역 실패 시 원문 반환
        return text;
      }
    }),
  );
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
  let ref: unknown = obj;
  // 마지막 필드 이름
  const field = parts[parts.length - 1];

  // 마지막 전까지 순차 접근, 배열이면 각 원소에 대해서 계속 탐색
  for (const part of parts.slice(0, -1)) {
    if (Array.isArray(ref)) {
      // 배열이면 각 원소에서 다음 part로 이동
      ref = ref.map((item) => (item as Record<string, unknown>)[part]);
    } else if (ref && typeof ref === "object" && part in ref) {
      ref = (ref as Record<string, unknown>)[part];
    } else {
      return [];
    }
  }

  // 배열이면 각 객체의 field값 추출
  if (Array.isArray(ref)) {
    return ref.map((item) => ({
      parent: item as Record<string, unknown>,
      key: field,
      value:
        typeof (item as Record<string, unknown>)[field] === "string"
          ? ((item as Record<string, unknown>)[field] as string)
          : "",
    }));
  }

  // 객체면 단일 값 추출
  if (ref && typeof ref === "object") {
    return [
      {
        parent: ref as Record<string, unknown>,
        key: field,
        value:
          typeof (ref as Record<string, unknown>)[field] === "string"
            ? ((ref as Record<string, unknown>)[field] as string)
            : "",
      },
    ];
  }

  return [];
}

/**
 * 번역 미들웨어
 * @param paths 번역할 필드 경로 배열
 * 여러개 번역 시 ["data.reviews.content", "data.reviews.NickName"]
 */
export function translationMiddleware(paths: string[] = ["data.reviews.content"]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const targetLang = typeof req.query.targetLang === "string" ? req.query.targetLang : undefined;

    if (!targetLang) return next();

    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      (async () => {
        try {
          for (const path of paths) {
            const items = getValueArrayByPath(body, path);
            if (items.length) {
              const texts = items.map((i) => i.value);
              const translated = await translateTextsSafeInline(texts, targetLang);
              items.forEach((i, idx) => {
                if (translated[idx] && translated[idx].trim() !== "") {
                  i.parent[i.key] = translated[idx];
                }
              });
            }
          }
        } catch (err) {
          console.error("[translationMiddleware] 번역 중 오류:", err);
        }
        originalJson(body);
      })();
      return res;
    };

    next();
  };
}
