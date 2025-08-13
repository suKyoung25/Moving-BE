import { translate } from "./translation.controller";
import translationService from "../services/translation.service";

// translationService 모킹
jest.mock("../services/translation.service");
const mockedTranslationService = translationService as jest.Mocked<typeof translationService>;

function createMockRes() {
  const status = jest.fn().mockReturnThis();
  const json = jest.fn().mockReturnThis();
  return { status, json } as any;
}

describe("translation.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("성공: text와 targetLang이 있으면 번역 결과를 반환한다", async () => {
    // Setup
    const req: any = { body: { text: "Hello", targetLang: "ko" } };
    const res = createMockRes();
    mockedTranslationService.translateText.mockResolvedValueOnce("안녕");

    // Exercise
    await translate(req, res);

    // Assertion
    expect(mockedTranslationService.translateText).toHaveBeenCalledWith("Hello", "ko");
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ translatedText: "안녕" });
  });

  test("실패: 필수 값 누락 시 400을 반환한다", async () => {
    // Setup
    const req: any = { body: {} };
    const res = createMockRes();

    // Exercise
    await translate(req, res);

    // Assertion
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "text와 targetLang을 모두 입력해야 합니다." });
    expect(mockedTranslationService.translateText).not.toHaveBeenCalled();
  });

  test("실패: 번역 서비스 에러 시 500을 반환한다", async () => {
    // Setup
    const req: any = { body: { text: "Hello", targetLang: "ko" } };
    const res = createMockRes();
    mockedTranslationService.translateText.mockRejectedValueOnce(new Error("DeepL error"));

    // Exercise
    await translate(req, res);

    // Assertion
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "DeepL error" });
  });
});
