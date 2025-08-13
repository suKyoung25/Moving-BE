import { translationMiddleware } from "./translation.middleware";
import translationService from "../services/translation.service";

// translationService 모킹
jest.mock("../services/translation.service");
const mockedTranslationService = translationService as jest.Mocked<typeof translationService>;

describe("TranslationMiddleware", () => {
  // 각 테스트 전에 모든 모킹을 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function createMockRes() {
    const json = jest.fn().mockReturnThis();
    return { json } as any;
  }

  describe("pass-through", () => {
    test("targetLang이 없으면 next만 호출하고 원본 json 유지", async () => {
      // Setup
      const req: any = { query: {} };
      const res = createMockRes();
      const next = jest.fn();
      const originalJson = res.json;

      // Exercise
      const mw = translationMiddleware(["data.content"]);
      mw(req, res as any, next);

      // Assertion
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.json).toBe(originalJson);
      const body = { data: { content: "Hello" } };
      res.json(body);
      expect(res.json).toHaveBeenCalledWith(body);
      expect(mockedTranslationService.translateText).not.toHaveBeenCalled();
    });
  });

  describe("single path translation", () => {
    test("단일 경로 문자열을 번역하여 응답에 반영", async () => {
      // Setup
      const req: any = { query: { targetLang: "ko" } };
      const res = createMockRes();
      const next = jest.fn();
      mockedTranslationService.translateText.mockResolvedValueOnce("안녕");

      // Exercise
      const mw = translationMiddleware(["data.content"]);
      mw(req, res as any, next);
      const body = { data: { content: "Hello" } };
      res.json(body);

      // Assertion
      await new Promise((resolve) => setImmediate(resolve));
      expect(next).toHaveBeenCalledTimes(1);
      expect(mockedTranslationService.translateText).toHaveBeenCalledWith("Hello", "ko");
      expect(body).toEqual({ data: { content: "안녕" } });
    });
  });

  describe("array path translation", () => {
    test("배열 경로에서 일부 번역 실패 시 해당 항목은 원문 유지", async () => {
      // Setup
      const req: any = { query: { targetLang: "ko" } };
      const res = createMockRes();
      const next = jest.fn();
      mockedTranslationService.translateText
        .mockResolvedValueOnce("A-ko")
        .mockRejectedValueOnce(new Error("fail"));

      // Exercise
      const mw = translationMiddleware(["data.reviews.content"]);
      mw(req, res as any, next);
      const body = { data: { reviews: [{ content: "A" }, { content: "B" }] } };
      res.json(body);

      // Assertion
      await new Promise((resolve) => setImmediate(resolve));
      expect(mockedTranslationService.translateText).toHaveBeenCalledTimes(2);
      expect(body.data.reviews).toEqual([{ content: "A-ko" }, { content: "B" }]);
    });
  });

  describe("missing path", () => {
    test("경로가 존재하지 않으면 번역 없이 통과", async () => {
      // Setup
      const req: any = { query: { targetLang: "ko" } };
      const res = createMockRes();
      const next = jest.fn();

      // Exercise
      const mw = translationMiddleware(["data.missing.field"]);
      mw(req, res as any, next);
      const body = { data: { other: "text" } };
      res.json(body);

      // Assertion
      await new Promise((resolve) => setImmediate(resolve));
      expect(mockedTranslationService.translateText).not.toHaveBeenCalled();
      expect(body).toEqual({ data: { other: "text" } });
    });
  });
});
