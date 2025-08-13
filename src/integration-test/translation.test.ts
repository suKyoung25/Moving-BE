// DeepL 외부 호출 차단을 위해 app 임포트보다 먼저 deepl-node 모킹
jest.mock("deepl-node", () => ({
  Translator: jest.fn().mockImplementation(() => ({
    translateText: (text: string) => Promise.resolve({ text: `${text}-trans` }),
  })),
}));

import request from "supertest";
import app from "../app";

describe("Integration: /api/translation", () => {
  test("POST /api/translation/translate 성공: 번역 텍스트 반환", async () => {
    const res = await request(app)
      .post("/api/translation/translate")
      .send({ text: "Hello", targetLang: "en" })
      .expect(200);

    expect(res.body).toHaveProperty("translatedText");
    expect(typeof res.body.translatedText).toBe("string");
    expect(res.body.translatedText.length).toBeGreaterThan(0);
  });

  test("POST /api/translation/translate 실패: 필수 값 누락 시 400", async () => {
    const res = await request(app).post("/api/translation/translate").send({}).expect(400);

    expect(res.body).toEqual({ message: "text와 targetLang을 모두 입력해야 합니다." });
  });
});
