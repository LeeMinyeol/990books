// 책 한 권의 데이터 구조. 슬라이드 내용은 전부 여기 타입에 맞는 JSON으로 두고,
// 넘김·전환·진행률 같은 동작은 공통 뷰어가 처리한다.

import type { Block } from "./blocks";

export type ImageRef = {
  /** 비어 있으면 "스크린샷 자리" 플레이스홀더를 보여준다 */
  src?: string;
  alt: string;
};

export type CoverSlide = {
  type: "cover";
  title: string;
  subtitle: string;
  /** 필요 도구, 소요 시간 등 짧은 칩 */
  chips: string[];
  /** 책 맨 앞에 보여주는 완성 결과물 미리보기 */
  preview: ImageRef;
};

export type ChecklistSlide = {
  type: "checklist";
  title: string;
  items: { label: string; note: string }[];
  totalCost: string;
  /** 최종 확인일 (YYYY-MM-DD) */
  checkedAt: string;
};

export type StepSlide = {
  type: "step";
  step: number;
  title: string;
  /** **굵게** 표기는 한 장당 하나만 */
  text: string;
  image?: ImageRef;
  /** 따라 할 입력값은 박스로 분리하고 복사 버튼을 붙인다 */
  prompt?: { label: string; text: string };
};

export type SummarySlide = {
  type: "summary";
  title: string;
  points: string[];
};

export type NextSlide = {
  type: "next";
  title: string;
  teaser: string;
  price: string;
};

export type Slide =
  | CoverSlide
  | ChecklistSlide
  | StepSlide
  | SummarySlide
  | NextSlide;

/**
 * 긴 글형 장(긴 글형 책 챕터). book.json에 쓰지 않는다.
 * 서버가 src/books/<slug>/chapters/NN-이름.md를 읽어 만든다.
 */
export type ChapterPage = {
  type: "chapter";
  no: number;
  title: string;
  blocks: Block[];
  /** 공백을 뺀 글자 수 */
  chars: number;
};

/** 결제 전 뷰어의 마지막 자리. 남은 장의 제목만 보여준다(내용은 보내지 않는다) */
export type LockedPage = {
  type: "locked";
  remaining: number;
  outline: string[];
  inputs: number;
};

/** 뷰어가 한 화면에 그리는 단위 */
export type ViewerPage = Slide | ChapterPage | LockedPage;

/** 상품 종류. 이름과 가격은 src/lib/pricing.ts에서 정한다 */
export type BookKind = "mini" | "kit" | "deep";

export type Book = {
  slug: string;
  /** 공개 전 책. 홈에 나오지 않고 개발 화면에서만 주소로 열린다 */
  draft?: boolean;
  kind: BookKind;
  /** 책마다 바꿀 수 있는 포인트컬러 */
  accent: string;
  /** 포인트컬러 바탕 위에 올리는 글자색. 없으면 흰색 */
  onAccent?: string;
  title: string;
  /** 분야 칩에 쓰는 이름 (예: "AI") */
  category: string;
  /** 분야 안의 세부 주제 (예: "인스타그램") */
  topic?: string;
  /** 슬라이드·입력값 말고 더 들어 있는 파일 (예: "30일 계획표 시트") */
  files?: string[];
  /** 사이트 카드용: 필요 도구 */
  tools: string;
  /** 사이트 카드용: 추가 비용 (예: "0원") */
  extraCost: string;
  minutes: number;
  /** 홈에 쓰는 한 줄 소개. 없으면 표지 장의 부제를 쓴다 */
  summary?: string;
  /** 홈에 쓰는 표지 이미지. 없으면 표지 장의 미리보기를 쓴다 */
  cover?: ImageRef;
  /** 완독자 후기 평점. 후기가 3개 이상일 때만 화면에 표시한다 */
  rating?: { average: number; count: number };
  /** 상세페이지 구성. 만드는 규칙은 .claude/skills/detail-page */
  detail?: DetailSpec;
  slides: Slide[];
};

/**
 * 상세페이지 블록. 책마다 순서와 종류를 다르게 고른다.
 * toc·preview·facts·refund·reviews는 책 데이터에서 내용을 자동으로 만든다.
 */
export type DetailBlock =
  | { type: "hero"; variant: "split" | "stack" | "band"; lead: string }
  | { type: "outcome"; title: string; image: ImageRef; caption: string }
  | { type: "includes"; title: string; items: { name: string; desc: string }[] }
  | { type: "for-whom"; title: string; items: string[] }
  | { type: "problem"; title: string; body: string }
  | { type: "before-after"; title: string; before: string; after: string }
  | { type: "steps"; title: string; items: { name: string; desc: string }[] }
  | { type: "toc"; title: string }
  | { type: "preview"; title: string }
  | { type: "faq"; title: string; items: { q: string; a: string }[] }
  | { type: "facts"; title: string }
  | { type: "refund"; title: string }
  | { type: "reviews"; title: string }
  | { type: "next"; title: string };

export type DetailSpec = {
  /** 블록 순서의 틀. A 결과물 중심, B 문제 해결 중심, C 도구 입문 중심, D 인사이트 */
  recipe: "A" | "B" | "C" | "D";
  blocks: DetailBlock[];
};

/** 아직 만들지 않은 책. 홈에 "준비 중"으로만 보인다 */
export type ComingBook = {
  slug: string;
  title: string;
  category: string;
  summary: string;
};

/** 홈 진열대(히어로·카드)가 쓰는 한 권의 요약 정보 */
export type ShelfItem = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  status: "open" | "coming";
  kind?: BookKind;
  topic?: string;
  /** "들어 있는 것" 목록. 슬라이드 수·입력값 수는 데이터에서 센다 */
  includes?: string[];
  /** 작성 시점 (YYYY-MM-DD) */
  writtenAt?: string;
  accent?: string;
  cover?: ImageRef;
  tools?: string;
  extraCost?: string;
  minutes?: number;
  slideCount?: number;
  /** 긴 글형 책의 챕터 수. 있으면 카드에 슬라이드 수 대신 보여준다 */
  chapterCount?: number;
  rating?: { average: number; count: number };
};
