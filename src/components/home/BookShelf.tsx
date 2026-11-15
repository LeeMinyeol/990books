"use client";

import Link from "next/link";
import { useState } from "react";
import type { BookKind, ShelfItem } from "@/lib/book";
import { KINDS, formatPrice } from "@/lib/pricing";
import BookFacts from "./BookFacts";
import BookJacket from "./BookJacket";

const ALL = "전체보기";
const JACKET_SIZES = "(min-width: 1024px) 260px, (min-width: 640px) 30vw, 104px";

/** 서가 순서와 한 줄 설명. 실전 키트는 보류라 서가를 두지 않는다 */
const SHELVES: { kind: BookKind; note: string }[] = [
  { kind: "mini", note: "한 번 따라 하면 결과물 하나가 남는 책" },
  { kind: "deep", note: "일할 때 다시 꺼내 보는 판단 기준을 담은 책" },
];

/** 책 카드: 모바일은 왼쪽 작은 표지 + 오른쪽 정보, 넓은 화면은 세로 표지 아래 정보 */
function BookCard({ item }: { item: ShelfItem }) {
  const kind = item.kind ? KINDS[item.kind] : null;
  return (
    <Link
      href={`/books/${item.slug}`}
      className="group flex gap-4 rounded-r-[10px] outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink sm:block"
    >
      <div className="w-[104px] shrink-0 motion-safe:transition-transform motion-safe:duration-200 sm:w-full motion-safe:group-hover:-translate-y-1">
        <BookJacket item={item} sizes={JACKET_SIZES} />
      </div>
      <div className="min-w-0 flex-1 sm:mt-4">
        <h3 className="type-title text-balance text-ink underline-offset-4 group-hover:underline">{item.title}</h3>
        <div className="mt-2">
          <BookFacts item={item} />
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-2">
          {kind && <span className="type-title text-ink">{formatPrice(kind.price)}</span>}
          {item.draft && <span className="type-caption rounded-full bg-brand px-2.5 py-1 text-on-brand">공개 전</span>}
        </p>
      </div>
    </Link>
  );
}

/** 서가(종류별) + 곧 나올 책. 분야 칩은 분야가 2개 이상일 때만 보인다 */
export default function BookShelf({ items }: { items: ShelfItem[] }) {
  const [category, setCategory] = useState(ALL);
  const open = items.filter((i) => i.status === "open");
  const coming = items.filter((i) => i.status === "coming");
  const categories = [...new Set(open.map((i) => i.category))];
  const pick = (list: ShelfItem[]) => (category === ALL ? list : list.filter((i) => i.category === category));

  return (
    <div id="shelves" className="mx-auto max-w-6xl scroll-mt-4 px-5 pb-14 pt-10 lg:px-8 lg:pb-20 lg:pt-14">
      {categories.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="분야 고르기">
          {[ALL, ...categories].map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={`type-label min-h-11 rounded-full border-2 px-5 outline-offset-2 transition-colors focus-visible:outline-2 focus-visible:outline-ink ${
                category === c ? "border-header bg-header text-white" : "border-ink bg-white text-ink hover:bg-panel"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-14 lg:gap-20">
        {SHELVES.map(({ kind, note }) => {
          const books = pick(open.filter((i) => i.kind === kind));
          if (books.length === 0) return null;
          return (
            <section key={kind} aria-labelledby={`shelf-${kind}`}>
              <h2 id={`shelf-${kind}`} className="type-heading text-ink">
                {KINDS[kind].label} <span className="text-sub">· {formatPrice(KINDS[kind].price)}</span>
              </h2>
              <p className="type-small mt-1 text-sub">{note}</p>
              <ul className="mt-6 grid gap-6 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
                {books.map((item) => (
                  <li key={item.slug}>
                    <BookCard item={item} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        {coming.length > 0 && (
          <section aria-labelledby="shelf-coming" className="border-t border-line pt-8">
            <h2 id="shelf-coming" className="type-title text-ink">
              곧 나올 책
            </h2>
            <ul className="mt-3 flex flex-col">
              {coming.map((c) => (
                <li key={c.slug} className="type-body flex items-baseline justify-between gap-4 border-b border-line py-3 text-ink">
                  <span className="min-w-0">{c.title}</span>
                  <span className="type-small shrink-0 text-sub">준비 중</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
