import type { BookKind } from "./book";

// 종류별 이름과 가격. 가격은 후보값이며, 테스트 책을 본 뒤 확정한다.
// 가격을 바꿀 때는 이 파일만 고친다.
export const KINDS: Record<BookKind, { label: string; price: number }> = {
  mini: { label: "미니북", price: 990 },
  kit: { label: "실전 키트", price: 4900 },
  deep: { label: "심화 가이드", price: 9900 },
};

export function formatPrice(won: number): string {
  return `${won.toLocaleString("ko-KR")}원`;
}

/** "2026-11-03" → "2026년 11월 3일" */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}
