import type { ComingBook } from "@/lib/book";

// 아직 만들지 않은 책. 책을 만들면 여기서 지우고 index.ts에 등록한다.
export const comingBooks: ComingBook[] = [
  {
    slug: "smartstore-detail",
    title: "스마트스토어 상세페이지, 클로드로 한 번에 만들기",
    category: "AI",
    summary: "상품 소개 페이지 한 장을 처음부터 끝까지 만들어요.",
  },
  {
    slug: "shorts-automation",
    title: "유튜브 쇼츠 자동화",
    category: "AI",
    summary: "쇼츠 영상 1편을 만드는 흐름을 익혀요.",
  },
];
