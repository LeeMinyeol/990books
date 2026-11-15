"use client";

import { useEffect, useRef, useState } from "react";
import type { ChapterPage } from "@/lib/book";
import Blocks from "@/components/content/Blocks";

/**
 * 긴 글형 장(긴 글형 책 챕터). 틀 안에서 세로로 스크롤해 읽는다.
 * PC는 왼쪽에 소제목 목차가 따라오고, 모바일은 접힌 목차를 맨 위에 둔다.
 */
export default function ChapterView({ page }: { page: ChapterPage }) {
  const root = useRef<HTMLDivElement>(null);
  const sections = page.blocks.filter((b) => b.type === "h2");
  const [active, setActive] = useState(sections[0]?.id ?? "");

  // 지금 읽는 소제목을 목차에 표시한다. 스크롤 틀의 위쪽을 지난 마지막 소제목이 기준이다
  useEffect(() => {
    const el = root.current;
    const scroller = el?.closest("main");
    if (!el || !scroller) return;
    const heads = Array.from(el.querySelectorAll<HTMLElement>("h2[id]"));
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const line = scroller.getBoundingClientRect().top + 120;
        let now = heads[0]?.id ?? "";
        for (const h of heads) if (h.getBoundingClientRect().top <= line) now = h.id;
        setActive(now);
      });
    };
    scroller.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", update);
    };
  }, [page.no]);

  function jump(id: string) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  const toc = (
    <ol className="flex flex-col">
      {sections.map((s) => (
        <li key={s.id}>
          <button
            type="button"
            onClick={() => jump(s.id)}
            aria-current={active === s.id ? "true" : undefined}
            className={`type-small flex min-h-11 w-full items-center border-l-2 pl-3 text-left outline-offset-2 transition-colors focus-visible:outline-2 focus-visible:outline-ink lg:min-h-9 ${
              active === s.id ? "border-accent font-bold text-ink" : "border-line text-sub hover:text-ink"
            }`}
          >
            {s.text}
          </button>
        </li>
      ))}
    </ol>
  );

  return (
    <div ref={root} className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-8 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-12 lg:px-10 lg:py-10">
      <aside className="hidden lg:block">
        <nav aria-label="이 장의 소제목" className="sticky top-8">
          <p className="type-caption mb-2 text-sub">이 장에서</p>
          {toc}
        </nav>
      </aside>

      <article className="min-w-0 max-w-[42.5rem]">
        <p className="type-label text-accent-ink">CHAPTER {page.no}</p>
        <h1 className="type-display mt-2 text-balance text-ink">{page.title}</h1>

        <details className="mt-5 rounded-2xl border border-line lg:hidden">
          <summary className="type-label flex min-h-11 cursor-pointer list-none items-center justify-between px-4 text-ink [&::-webkit-details-marker]:hidden">
            이 장에서
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <nav aria-label="이 장의 소제목" className="px-4 pb-3">
            {toc}
          </nav>
        </details>

        <div className="mt-8">
          <Blocks blocks={page.blocks} />
        </div>
      </article>
    </div>
  );
}
