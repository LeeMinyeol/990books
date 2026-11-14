// 누가 어디까지 볼 수 있는지 서버에서 정한다.
// 로그인·결제가 붙기 전이라 지금은 개발용 설정값(.env.local)만 본다.
// 결제를 붙일 때는 getAccess 안쪽만 "이 사용자가 이 책을 샀는가"로 바꾸면 된다.

/** 결제 전에 보여주는 장 수 (모든 책의 앞 3장) */
export const FREE_PAGES = 3;

export type Access = {
  /** 책 전체를 볼 수 있는가 */
  full: boolean;
  /** 장마다 옅게 표시할 구매자 이메일. 무료 구간에는 넣지 않는다 */
  watermark: string | null;
};

// 책(slug)과 사용자를 받아 판단하도록 바꿀 자리다. 지금은 설정값 하나로 정한다.
export function getAccess(): Access {
  const full = process.env.BOOKS_UNLOCK_ALL === "1";
  return {
    full,
    watermark: full ? process.env.BOOKS_WATERMARK_SAMPLE || null : null,
  };
}

/** 공개 전 책과 검수 전 글은 개발 화면에서만 보인다 */
export const SHOW_DRAFTS = process.env.NODE_ENV !== "production";
