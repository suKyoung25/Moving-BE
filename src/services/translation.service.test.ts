const mockTranslateText = jest.fn();

// deepl-node 모듈 모킹: Translator 인스턴스의 translateText만 사용
jest.mock("deepl-node", () => {
  return {
    Translator: jest.fn().mockImplementation(() => ({
      translateText: mockTranslateText,
    })),
  };
});

describe("translation.service", () => {
  let translationService: typeof import("./translation.service")["default"];

  beforeAll(async () => {
    process.env.DEEPL_API_KEY = "dummy";
    translationService = (await import("./translation.service")).default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("targetLang 미지정 시 원문을 반환하고 외부 호출을 하지 않는다", async () => {
    // Exercise
    const result = await translationService.translateText("Hello");

    // Assertion
    expect(result).toBe("Hello");
    expect(mockTranslateText).not.toHaveBeenCalled();
  });

  test("유효한 언어 코드는 정규화되어 전달된다 (en -> en-US)", async () => {
    // Setup
    mockTranslateText.mockResolvedValueOnce({ text: "Hello-trans" });

    // Exercise
    const result = await translationService.translateText("Hello", "en");

    // Assertion
    expect(mockTranslateText).toHaveBeenCalledWith("Hello", null, "en-US");
    expect(result).toBe("Hello-trans");
  });

  test("하이픈 코드도 대소문자 무관하게 정규화된다 (EN-gb -> en-GB)", async () => {
    // Setup
    mockTranslateText.mockResolvedValueOnce({ text: "Colour-trans" });

    // Exercise
    const result = await translationService.translateText("Colour", "EN-gb");

    // Assertion
    expect(mockTranslateText).toHaveBeenCalledWith("Colour", null, "en-GB");
    expect(result).toBe("Colour-trans");
  });

  test("지원하지 않는 언어 코드는 에러를 던진다", async () => {
    // Exercise & Assertion
    await expect(translationService.translateText("Hello", "xx")).rejects.toThrow(
      /지원하지 않는 targetLang 코드입니다: xx/,
    );
    expect(mockTranslateText).not.toHaveBeenCalled();
  });
});


