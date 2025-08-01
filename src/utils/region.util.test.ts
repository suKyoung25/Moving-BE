import { moveTypeMap, parseRegion, parseRegionKeywords } from "./region.util";

describe.skip("moveTypeMap 함수", () => {
  describe("moveTypeMap 함수", () => {
    test("유효한 이사 유형에 대해 올바른 한글명을 반환한다", () => {
      expect(moveTypeMap("SMALL")).toBe("소형이사");
      expect(moveTypeMap("HOME")).toBe("가정이사");
      expect(moveTypeMap("OFFICE")).toBe("사무실이사");
    });

    test("알 수 없는 이사 유형에 대해 기본값 '이사'를 반환한다", () => {
      expect(moveTypeMap("LUXURY")).toBe("이사");
      expect(moveTypeMap("")).toBe("이사");
    });
  });

  describe("parseRegion 함수", () => {
    test("서울 주소에서 시와 구를 올바르게 추출한다", () => {
      expect(parseRegion("서울시 강남구 삼성동")).toBe("서울(강남구)");
      expect(parseRegion("서울특별시 강남구")).toBe("서울(강남구)");
      expect(parseRegion("경기도 성남시 분당구")).toBe("경기(성남시)");
    });

    test("경기 주소에서 시와 시군구를 올바르게 추출한다", () => {
      expect(parseRegion("경기도 성남시 분당구")).toBe("경기(성남시)");
    });

    test("빈 문자열이 주어지면 빈 문자열을 반환한다", () => {
      expect(parseRegion("")).toBe("");
    });
  });

  describe("parseRegionKeywords 함수", () => {
    test("주소에서 앞의 3단계 지역 키워드를 추출하고 시/군/구 접미사를 제거한다", () => {
      expect(parseRegionKeywords("경기 성남시 분당구 판교역로 166")).toEqual([
        "경기",
        "성남",
        "분당",
      ]);
    });

    test("주소가 2단계 이하인 경우에도 올바르게 처리한다", () => {
      expect(parseRegionKeywords("서울시 강남구")).toEqual(["서울", "강남"]);
    });

    test("빈 문자열이 주어지면 빈 배열을 반환한다", () => {
      expect(parseRegionKeywords("")).toEqual([]);
    });
  });
});
