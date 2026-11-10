"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import type { ShelfItem } from "@/lib/book";
import BookCover from "./BookCover";
import BookFacts from "./BookFacts";

const ALL = "전체보기";
const COVER_SIZES = "(min-width: 1024px) 352px, (min-width: 640px) 50vw, 100vw";

function CardBody({ item }: { item: ShelfItem }) {
  return (
    <>
      <BookCover item={item} sizes={COVER_SIZES} />
      <h3
        className={`mt-4 text-balance font-title text-xl leading-snug ${
          item.status === "coming" ? "text-neutral-500" : "text-ink"
        }`}
      >
        {item.title}
      </h3>
      <div className="mt-3">
        <BookFacts item={item} />
      </div>
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
    <section aria-labelledby="shelf-title" className="mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
      <h2 id="shelf-title" className="sr-only">
        책 목록
      </h2>
      <div className="flex flex-wrap gap-2" role="group" aria-label="분야 고르기">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
            className={`min-h-11 rounded-full border px-5 text-sm font-bold outline-offset-2 transition-colors focus-visible:outline-2 focus-visible:outline-ink ${
              category === c
                ? "border-ink bg-ink text-white"
                : "border-neutral-300 bg-white text-ink hover:border-ink"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 text-sub">이 분야의 책을 준비하고 있어요.</p>
      ) : (
        <ul className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <li key={item.slug}>
              {item.status === "open" ? (
                <Link
                  href={`/books/${item.slug}`}
                  style={{ "--accent": item.accent } as CSSProperties}
                  className="group block rounded-xl outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink [&>div:first-child]:transition-colors hover:[&>div:first-child]:border-accent"
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
