import type { ShelfItem } from "@/lib/book";

/** 후기 평점은 후기가 이 개수 이상일 때부터 보여준다 */
const MIN_REVIEWS = 3;

/** 책 카드·히어로 공통 정보. 순서 고정: 필요 도구·추가 비용 → 소요 시간·슬라이드 수 → 완독 후기 */
export default function BookFacts({ item }: { item: ShelfItem }) {
  if (item.status === "coming") {
    return <p className="text-sm text-ink/65">준비 중이에요</p>;
  }
  const rating = item.rating && item.rating.count >= MIN_REVIEWS ? item.rating : null;
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm text-ink">
      <dt className="text-ink/65">필요 도구</dt>
      <dd>
        {item.tools}, 추가 비용 {item.extraCost}
      </dd>
      <dt className="text-ink/65">소요 시간</dt>
      <dd>
        {item.minutes}분, 슬라이드 {item.slideCount}장
      </dd>
      {rating && (
        <>
          <dt className="text-ink/65">완독 후기</dt>
          <dd>
            {rating.average.toFixed(1)}점, 후기 {rating.count}개
          </dd>
        </>
      )}
    </dl>
  );
}
