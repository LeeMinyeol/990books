"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { ShelfItem } from "@/lib/book";
import { KINDS, formatDate, formatPrice } from "@/lib/pricing";
import BookCover from "./BookCover";
import SoonButton from "./SoonButton";

function Arrow({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0" aria-hidden>
      <circle cx="10" cy="10" r="10" className="fill-brand" />
      <path d="m5.5 10.2 3 3 6-6.4" fill="none" className="stroke-on-brand" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Slide({ item, first }: { item: ShelfItem; first: boolean }) {
  const kind = item.kind ? KINDS[item.kind] : null;
  const meta = [
    item.minutes ? `따라 하는 데 ${item.minutes}분` : null,
    item.extraCost ? `추가 비용 ${item.extraCost}` : null,
    item.writtenAt ? `${formatDate(item.writtenAt)} 작성` : null,
  ].filter(Boolean);

  return (
    <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-9 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:px-8 lg:py-16">
      <BookCover
        item={item}
        sizes="(min-width: 1024px) 540px, 100vw"
        priority={first}
        className="rounded-3xl lg:order-last"
      />
      <div>
        <p className="type-label text-sub">{[item.category, item.topic].filter(Boolean).join(", ")}</p>
        <h2 className="type-display mt-3 text-balance">{item.title}</h2>
        <p className="type-body mt-4 text-sub">{item.summary}</p>
        {item.includes && (
          <ul className="type-body mt-5 flex flex-col gap-2">
            {item.includes.map((line) => (
              <li key={line} className="flex items-center gap-2.5">
                <Check />
                {line}
              </li>
            ))}
          </ul>
        )}
        {meta.length > 0 && <p className="type-small mt-4 text-sub">{meta.join(", ")}</p>}
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href={`/books/${item.slug}`}
            className="type-label flex min-h-13 items-center rounded-full bg-brand px-7 text-on-brand outline-offset-2 transition hover:brightness-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-ink"
          >
            앞 3장 무료로 보기
          </Link>
          {kind && (
            <SoonButton
              align="left"
              message="결제는 준비 중이에요"
              className="type-label min-h-13 rounded-full border-2 border-ink px-7 text-ink outline-offset-2 transition hover:bg-ink hover:text-white active:scale-95 focus-visible:outline-2 focus-visible:outline-ink"
            >
              전체 보기 {formatPrice(kind.price)}
            </SoonButton>
          )}
        </div>
      </div>
    </div>
  );
}

/** 대표 책. 공개된 책이 2권 이상이면 화살표·스와이프·키보드로 넘긴다(자동 넘김 없음) */
export default function HeroCarousel({ items }: { items: ShelfItem[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const total = items.length;
  if (total === 0) return null;

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

  if (total === 1) {
    return (
      <section aria-label="대표 책">
        <Slide item={items[0]} first />
      </section>
    );
  }

  const arrowClass =
    "flex h-11 w-11 items-center justify-center rounded-full border border-ink bg-white text-ink outline-offset-2 transition hover:bg-ink hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-ink";

  return (
    <section
      aria-roledescription="carousel"
      aria-label="대표 책"
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
            className="w-full shrink-0 snap-start"
          >
            <Slide item={item} first={i === 0} />
          </div>
        ))}
      </div>
      <div className="mx-auto -mt-4 flex max-w-6xl items-center justify-end gap-3 px-5 pb-8 lg:px-8">
        <button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label="이전 책" className={arrowClass}>
          <Arrow dir="prev" />
        </button>
        <span className="type-label min-w-12 text-center tabular-nums" aria-live="polite">
          {index + 1} / {total}
        </span>
        <button type="button" onClick={() => go(index + 1)} disabled={index === total - 1} aria-label="다음 책" className={arrowClass}>
          <Arrow dir="next" />
        </button>
      </div>
    </section>
  );
}
