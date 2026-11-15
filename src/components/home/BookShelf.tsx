"use client";

import Link from "next/link";
import { useState } from "react";
import type { ShelfItem } from "@/lib/book";
import { KINDS, formatPrice } from "@/lib/pricing";
import BookCover from "./BookCover";
import BookFacts from "./BookFacts";

const ALL = "전체보기";
const COVER_SIZES = "(min-width: 1024px) 352px, (min-width: 640px) 50vw, 100vw";

function CardBody({ item }: { item: ShelfItem }) {
  const kind = item.kind ? KINDS[item.kind] : null;
  return (
    <>
      <div className="relative">
        <BookCover item={item} sizes={COVER_SIZES} />
        {kind && (
          <span className="type-caption absolute left-3 top-3 rounded-full bg-header px-3 py-1 text-white">
            {kind.label}
          </span>
        )}
        {item.draft && (
          <span className="type-caption absolute right-3 top-3 rounded-full bg-brand px-3 py-1 text-on-brand">공개 전</span>
        )}
      </div>
      <h3 className={`type-title mt-4 text-balance ${item.status === "coming" ? "text-sub" : "text-ink"}`}>
        {item.title}
      </h3>
      <div className="mt-2">
        <BookFacts item={item} />
      </div>
      <p className={`type-title mt-2 ${item.status === "coming" ? "text-sub" : "text-ink"}`}>
        {item.status === "coming" ? "준비 중" : kind ? formatPrice(kind.price) : ""}
      </p>
    </>
  );
}

/** 분야 칩 + 책 카드 그리드 */
export default function BookShelf({ items }: { items: ShelfItem[] }) {
  const [category, setCategory] = useState(ALL);
  // 책이 있는 분야만 칩으로 보여준다
  const categories = [ALL, ...new Set(items.map((i) => i.category))];
  const visible = category === ALL ? items : items.filter((i) => i.category === category);

  return (
    <section aria-labelledby="shelf-title" className="mx-auto max-w-6xl px-5 pb-14 pt-8 lg:px-8 lg:pb-20 lg:pt-10">
      <h2 id="shelf-title" className="type-heading">
        전자책
      </h2>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="분야 고르기">
        {categories.map((c) => (
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

      {visible.length === 0 ? (
        <p className="type-body mt-10 text-sub">이 분야의 책을 준비하고 있어요.</p>
      ) : (
        <ul className="mt-7 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <li key={item.slug}>
              {item.status === "open" ? (
                <Link
                  href={`/books/${item.slug}`}
                  className="group block rounded-2xl outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink [&_h3]:underline-offset-4 hover:[&_h3]:underline"
                >
                  <CardBody item={item} />
                </Link>
              ) : (
                <div>
                  <CardBody item={item} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
