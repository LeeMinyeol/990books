"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import type { ShelfItem } from "@/lib/book";
import BookCover from "./BookCover";
import BookFacts from "./BookFacts";

function Arrow({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

/** 추천 책 캐러셀. 자동으로 넘기지 않고 화살표·스와이프·키보드로만 넘긴다 */
export default function HeroCarousel({ items }: { items: ShelfItem[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const total = items.length;

  function go(to: number) {
    const el = track.current;
    if (!el) return;
    const next = Math.min(Math.max(to, 0), total - 1);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: next * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  }

  function onScroll() {
    const el = track.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  const arrowClass =
    "pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-ink bg-white text-ink outline-offset-2 transition hover:bg-ink hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-ink";

  return (
    <section
      aria-roledescription="carousel"
      aria-label="추천 책"
      className="relative"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div
        ref={track}
        onScroll={onScroll}
        tabIndex={0}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
      >
        {items.map((item, i) => (
          <div
            key={item.slug}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${total}`}
            style={item.accent ? ({ "--accent": item.accent } as CSSProperties) : undefined}
            className={`w-full shrink-0 snap-start ${item.status === "coming" ? "bg-neutral-100" : "bg-accent-soft"}`}
          >
            <div className="mx-auto grid max-w-6xl items-center gap-7 px-5 pb-24 pt-8 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:pb-24 lg:pt-14">
              <div className="relative">
                <BookCover item={item} sizes="(min-width: 1024px) 544px, 100vw" priority={i === 0} />
                {item.status === "open" && (
                  <span className="absolute -bottom-5 -right-2 flex h-20 w-20 -rotate-12 items-center justify-center rounded-full border-[3px] border-accent bg-white font-title text-xl text-accent lg:-bottom-6 lg:-right-6 lg:h-24 lg:w-24 lg:text-2xl">
                    990원
                  </span>
                )}
              </div>
              <div className="flex flex-col items-start gap-4">
                <h2 className="text-balance font-title text-3xl leading-tight text-ink lg:text-[2.75rem] lg:leading-[1.2]">
                  {item.title}
                </h2>
                <p className="text-base text-ink/80 lg:text-lg">{item.summary}</p>
                <BookFacts item={item} />
                {item.status === "open" && (
                  <Link
                    href={`/books/${item.slug}`}
                    className="mt-2 flex min-h-12 items-center rounded-full bg-ink px-7 text-base font-bold text-white outline-offset-2 transition hover:bg-neutral-700 active:scale-95 focus-visible:outline-2 focus-visible:outline-ink"
                  >
                    이 책 보기
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {total > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-6">
          <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-5 lg:px-8">
            <button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label="이전 책" className={arrowClass}>
              <Arrow dir="prev" />
            </button>
            <span className="min-w-12 text-center text-sm font-bold tabular-nums text-ink" aria-live="polite">
              {index + 1} / {total}
            </span>
            <button type="button" onClick={() => go(index + 1)} disabled={index === total - 1} aria-label="다음 책" className={arrowClass}>
              <Arrow dir="next" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
