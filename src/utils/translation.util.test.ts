import { translateData, translateText, translateTexts } from "./translation.util";
import translationService from "../services/translation.service";

// translationService 모킹
jest.mock("../services/translation.service");
const mockedTranslationService = translationService as jest.Mocked<typeof translationService>;

describe("TranslationUtil", () => {
  // 각 테스트 전에 모든 모킹을 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("translateText", () => {
    test("targetLang이 없으면 원문 반환", async () => {
      const result = await translateText("Hello", undefined);
      expect(result).toBe("Hello");
      expect(mockedTranslationService.translateText).not.toHaveBeenCalled();
    });

    test("번역 성공 시 번역된 텍스트 반환", async () => {
      mockedTranslationService.translateText.mockResolvedValueOnce("안녕");
      
      const result = await translateText("Hello", "ko");
      
      expect(result).toBe("안녕");
      expect(mockedTranslationService.translateText).toHaveBeenCalledWith("Hello", "ko");
    });

    test("번역 실패 시 원문 반환", async () => {
      mockedTranslationService.translateText.mockRejectedValueOnce(new Error("Translation failed"));
      
      const result = await translateText("Hello", "ko");
      
      expect(result).toBe("Hello");
      expect(mockedTranslationService.translateText).toHaveBeenCalledWith("Hello", "ko");
    });
  });

  describe("translateTexts", () => {
    test("targetLang이 없으면 원문 배열 반환", async () => {
      const texts = ["Hello", "World"];
      const result = await translateTexts(texts, undefined);
      
      expect(result).toEqual(texts);
      expect(mockedTranslationService.translateText).not.toHaveBeenCalled();
    });

    test("여러 텍스트 병렬 번역 성공", async () => {
      mockedTranslationService.translateText
        .mockResolvedValueOnce("안녕")
        .mockResolvedValueOnce("세계");
      
      const texts = ["Hello", "World"];
      const result = await translateTexts(texts, "ko");
      
      expect(result).toEqual(["안녕", "세계"]);
      expect(mockedTranslationService.translateText).toHaveBeenCalledTimes(2);
      expect(mockedTranslationService.translateText).toHaveBeenCalledWith("Hello", "ko");
      expect(mockedTranslationService.translateText).toHaveBeenCalledWith("World", "ko");
    });

    test("일부 번역 실패 시 해당 항목은 원문 반환", async () => {
      mockedTranslationService.translateText
        .mockResolvedValueOnce("안녕")
        .mockRejectedValueOnce(new Error("Translation failed"));
      
      const texts = ["Hello", "World"];
      const result = await translateTexts(texts, "ko");
      
      expect(result).toEqual(["안녕", "World"]);
    });
  });

  describe("translateData", () => {
    test("targetLang이 없으면 원본 데이터 반환", async () => {
      const data = { reviews: [{ content: "Hello" }] };
      const result = await translateData(data, ["reviews.content"], undefined);
      
      expect(result).toEqual(data);
      expect(mockedTranslationService.translateText).not.toHaveBeenCalled();
    });

    test("단일 경로 번역 성공", async () => {
      mockedTranslationService.translateText.mockResolvedValueOnce("안녕");
      
      const data = { reviews: [{ content: "Hello" }] };
      const result = await translateData(data, ["reviews.content"], "ko");
      
      expect(result).toEqual({ reviews: [{ content: "안녕" }] });
      expect(mockedTranslationService.translateText).toHaveBeenCalledWith("Hello", "ko");
    });

    test("여러 경로 번역 성공", async () => {
      mockedTranslationService.translateText
        .mockResolvedValueOnce("안녕")
        .mockResolvedValueOnce("세계");
      
      const data = { 
        reviews: [{ content: "Hello" }],
        title: "World"
      };
      const result = await translateData(data, ["reviews.content", "title"], "ko");
      
      expect(result).toEqual({ 
        reviews: [{ content: "안녕" }],
        title: "세계"
      });
      expect(mockedTranslationService.translateText).toHaveBeenCalledTimes(2);
    });

    test("배열 내 여러 객체 번역", async () => {
      mockedTranslationService.translateText
        .mockResolvedValueOnce("첫 번째")
        .mockResolvedValueOnce("두 번째");
      
      const data = { 
        reviews: [
          { content: "First review" },
          { content: "Second review" }
        ]
      };
      const result = await translateData(data, ["reviews.content"], "ko");
      
      expect(result).toEqual({ 
        reviews: [
          { content: "첫 번째" },
          { content: "두 번째" }
        ]
      });
      expect(mockedTranslationService.translateText).toHaveBeenCalledTimes(2);
    });

    test("존재하지 않는 경로는 무시", async () => {
      const data = { reviews: [{ content: "Hello" }] };
      const result = await translateData(data, ["nonexistent.field"], "ko");
      
      expect(result).toEqual(data);
      expect(mockedTranslationService.translateText).not.toHaveBeenCalled();
    });

    test("빈 문자열은 번역하지 않음", async () => {
      const data = { reviews: [{ content: "" }] };
      const result = await translateData(data, ["reviews.content"], "ko");
      
      expect(result).toEqual(data);
      expect(mockedTranslationService.translateText).not.toHaveBeenCalled();
    });

    test("번역 실패 시 원본 데이터 유지", async () => {
      mockedTranslationService.translateText.mockRejectedValueOnce(new Error("Translation failed"));
      
      const data = { reviews: [{ content: "Hello" }] };
      const result = await translateData(data, ["reviews.content"], "ko");
      
      expect(result).toEqual(data);
      expect(mockedTranslationService.translateText).toHaveBeenCalledWith("Hello", "ko");
    });
  });
});
