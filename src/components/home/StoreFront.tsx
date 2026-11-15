import Link from "next/link";
import type { ShelfItem } from "@/lib/book";
import { KINDS, formatPrice } from "@/lib/pricing";
import BookJacket from "./BookJacket";

/** 책장에 세우는 책의 폭(px). 폭이 다르면 같은 비율의 표지라도 높이가 달라져 진짜 책장처럼 보인다 */
const WIDTHS = ["w-[100px] lg:w-[160px]", "w-[92px] lg:w-[132px]", "w-[104px] lg:w-[164px]", "hidden lg:block lg:w-[124px]"];

/**
 * 홈 첫 화면 "책방 입구"(docs/wireframe.md 3-1b).
 * 왼쪽은 사이트 약속과 두 종류의 책, 오른쪽은 표지가 선 책장. 오렌지 버튼은 "책 둘러보기" 하나다.
 */
export default function StoreFront({ books, hasColumns }: { books: ShelfItem[]; hasColumns: boolean }) {
  const standing = books.slice(0, WIDTHS.length);
  return (
    <section aria-labelledby="store-title" className="bg-panel">
      <div className="mx-auto grid max-w-6xl items-end gap-10 px-5 pb-12 pt-10 lg:grid-cols-[1fr_auto] lg:gap-16 lg:px-8 lg:pb-16 lg:pt-16">
        <div className="max-w-xl">
          <h1 id="store-title" className="type-display text-balance text-ink">
            필요한 만큼만 읽는
            <br />
            작은 웹 책방
          </h1>
          <p className="type-body mt-4 text-ink">
            따라 하기 책은 {formatPrice(KINDS.mini.price)}, 인사이트 책은 {formatPrice(KINDS.deep.price)}이에요. 모든 책은 앞
            3장을 무료로 읽을 수 있어요.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href="#shelves"
              className="type-label inline-flex min-h-12 items-center rounded-full bg-brand px-6 text-on-brand outline-offset-2 transition-transform active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-ink"
            >
              책 둘러보기
            </a>
            {hasColumns && (
              <Link
                href="/columns"
                className="type-label inline-flex min-h-11 items-center rounded text-ink underline-offset-4 outline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ink"
              >
                오늘의 칼럼 읽기 →
              </Link>
            )}
          </div>
        </div>

        {standing.length > 0 && (
          <div className="relative">
            <ul className="flex items-end gap-3 px-2 lg:gap-4" aria-label="책장">
              {standing.map((b, i) => (
                <li key={b.slug} className={`${WIDTHS[i]} shrink-0 motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:-translate-y-1.5`}>
                  <Link
                    href={`/books/${b.slug}`}
                    aria-label={b.title}
                    className="block rounded-r-[10px] outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink"
                  >
                    <BookJacket item={b} sizes="160px" />
                  </Link>
                </li>
              ))}
            </ul>
            {/* 책장 선반 */}
            <div className="h-2.5 rounded-sm bg-header shadow-[0_8px_14px_-8px_rgba(20,20,20,0.6)]" />
          </div>
        )}
      </div>
    </section>
  );
}
