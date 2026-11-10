// 책 한 권의 데이터 구조. 슬라이드 내용은 전부 여기 타입에 맞는 JSON으로 두고,
// 넘김·전환·진행률 같은 동작은 공통 뷰어가 처리한다.

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

export type Book = {
  slug: string;
  /** 책마다 바꿀 수 있는 포인트컬러 */
  accent: string;
  title: string;
  /** 분야 칩에 쓰는 이름 (예: "AI") */
  category: string;
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
  slides: Slide[];
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
  accent?: string;
  cover?: ImageRef;
  tools?: string;
  extraCost?: string;
  minutes?: number;
  slideCount?: number;
  rating?: { average: number; count: number };
};
