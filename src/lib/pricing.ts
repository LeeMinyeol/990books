import type { BookKind } from "./book";

// 종류별 이름과 가격. 가격을 바꿀 때는 이 파일만 고친다.
// 2026-11-15 결정: 따라 하기 990원, 인사이트 9,900원. 실전 키트는 보류(지금은 만들지 않는다).
export const KINDS: Record<BookKind, { label: string; price: number }> = {
  mini: { label: "따라 하기", price: 990 },
  kit: { label: "실전 키트", price: 4900 },
  deep: { label: "인사이트", price: 9900 },
};

export function formatPrice(won: number): string {
  return `${won.toLocaleString("ko-KR")}원`;
}

/** "2026-11-03" → "2026년 11월 3일" */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}
