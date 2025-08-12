import * as deepl from "deepl-node";

const authKey = process.env.DEEPL_API_KEY!;
const translator = new deepl.Translator(authKey);

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
 * 텍스트를 지정한 언어로 번역하는 함수
 */
async function translateText(text: string, targetLang?: string): Promise<string> {
  if (!targetLang) {
    return text;
  }

  const normalizedLang = normalizeTargetLang(targetLang);
  if (!normalizedLang || !isValidTargetLanguageCode(normalizedLang)) {
    throw new Error(`지원하지 않는 targetLang 코드입니다: ${targetLang}`);
  }

  const result = await translator.translateText(text, null, normalizedLang);
  return result.text;
}

export default { translateText };
