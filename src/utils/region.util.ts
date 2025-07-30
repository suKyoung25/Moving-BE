export const MoveTypeMap: Record<string, string> = {
  SMALL: "소형이사",
  HOME: "가정이사",
  OFFICE: "사무실이사",
};

export function moveTypeMap(type: string): string {
  return MoveTypeMap[type] ?? "이사";
}

// 주소명 파싱
export function parseRegion(address: string): string {
  if (!address) return "";

  const parts = address.split(" ");
  const sidoRaw = parts[0] || "";
  const sido = sidoRaw.replace(/(특별시|광역시|시|도)/g, ""); // 서울시 → 서울, 경기도 → 경기

  // 두 번째나 세 번째 단어에서 '시', '군', '구'가 포함된 것을 찾음
  const sigungu = parts.find((p, i) => i > 0 && /[시군구]/.test(p)) || "";

  return `${sido}(${sigungu})`;
}

export function parseRegionKeywords(address: string): string[] {
  if (!address) return [];
  const parts = address.split(" "); // ["경기", "성남시", "분당구", ...]
  return parts
    .slice(0, 3) // 앞 3개까지만 (시/도/구)
    .map((p) => p.replace(/(시|군|구)/g, ""));
}
