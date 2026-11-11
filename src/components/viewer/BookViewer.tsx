"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { Book } from "@/lib/book";
import { clearProgress, saveProgress, useSavedProgress } from "@/lib/progress";
import SlideRenderer from "./SlideRenderer";

export default function BookViewer({ book }: { book: Book }) {
  const total = book.slides.length;
  const { ready, saved } = useSavedProgress(book.slug);
  const [index, setIndex] = useState<number | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const touch = useRef<{ x: number; y: number } | null>(null);

  // 이어보기: 저장된 장에서 시작한다. 이미 끝까지 본 책이면 처음부터.
  const resumeAt =
    ready && saved && saved.last > 0 && saved.last < total - 1 ? saved.last : 0;
  const current = index ?? resumeAt;
  const percent = Math.round(((current + 1) / total) * 100);

  const go = useCallback(
    (to: number) => {
      const next = Math.min(Math.max(to, 0), total - 1);
      if (next === current && index !== null) return;
      setDir(next >= current ? 1 : -1);
      setIndex(next);
      saveProgress(book.slug, next, total);
    },
    [book.slug, current, index, total],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(current + 1);
      if (e.key === "ArrowLeft") go(current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, current]);

  function onTouchEnd(e: React.TouchEvent) {
    const s = touch.current;
    touch.current = null;
    if (!s) return;
    const dx = e.changedTouches[0].clientX - s.x;
    const dy = e.changedTouches[0].clientY - s.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      go(current + (dx < 0 ? 1 : -1));
    }
  }

  const style = { "--accent": book.accent, "--on-accent": book.onAccent ?? "#fff" } as CSSProperties;

  return (
    <div style={style} className="flex min-h-dvh flex-col items-center justify-center bg-neutral-100 lg:gap-4 lg:p-6">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-white lg:h-auto lg:max-w-[1100px] lg:aspect-video lg:rounded-3xl lg:shadow-xl">
        {/* 진행률 */}
        <header className="shrink-0 px-5 pt-3 lg:px-8 lg:pt-4">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-neutral-600">
            <span className="truncate pr-4">{book.title}</span>
            <span className="shrink-0 tabular-nums">
              {current + 1} / {total} · {percent}%
            </span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-neutral-200"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={current + 1}
            aria-label="읽은 진행률"
          >
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </header>

        {/* 슬라이드 */}
        <main
          className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
          onTouchStart={(e) => {
            touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          }}
          onTouchEnd={onTouchEnd}
        >
          {ready && (
            <div
              key={current}
              className={`flex min-h-full flex-col ${dir === 1 ? "animate-in-next" : "animate-in-prev"}`}
            >
              <SlideRenderer slide={book.slides[current]} />
            </div>
          )}

          {index === null && resumeAt > 0 && (
            <div className="absolute inset-x-0 top-3 z-10 flex justify-center px-4">
              <div className="flex items-center gap-3 rounded-full bg-neutral-900 py-2 pl-4 pr-2 text-sm text-white shadow-lg">
                <span>{resumeAt + 1}장에서 이어서 볼게요</span>
                <button
                  type="button"
                  onClick={() => {
                    clearProgress(book.slug);
                    go(0);
                  }}
                  className="min-h-9 rounded-full bg-white/20 px-3 font-bold"
                >
                  처음부터
                </button>
              </div>
            </div>
          )}
        </main>

        {/* 넘기기 */}
        <footer className="flex shrink-0 items-center justify-between gap-3 px-5 pb-4 pt-2 lg:px-8 lg:pb-5">
          <button
            type="button"
            onClick={() => go(current - 1)}
            disabled={current === 0}
            className="min-h-11 rounded-full border border-neutral-300 px-5 text-sm font-bold text-neutral-700 transition active:scale-95 disabled:opacity-30"
            aria-label="이전 장"
          >
            ← 이전
          </button>
          <span className="hidden text-xs text-neutral-400 lg:block">키보드 ← → 로도 넘길 수 있어요</span>
          {current === total - 1 ? (
            <button
              type="button"
              onClick={() => go(0)}
              className="min-h-11 rounded-full bg-neutral-900 px-6 text-sm font-bold text-white transition active:scale-95"
            >
              처음으로
            </button>
          ) : (
            <button
              type="button"
              onClick={() => go(current + 1)}
              className="min-h-11 rounded-full bg-accent px-6 text-sm font-bold text-on-accent transition active:scale-95"
              aria-label="다음 장"
            >
              다음 →
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
