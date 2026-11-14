"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { ViewerPage } from "@/lib/book";
import { clearProgress, saveProgress, useSavedProgress } from "@/lib/progress";
import ChapterView from "./ChapterView";
import ContentGuard from "./ContentGuard";
import LockedView from "./LockedView";
import SlideRenderer from "./SlideRenderer";
import Watermark from "./Watermark";

type Props = {
  book: { slug: string; title: string; accent: string; onAccent?: string };
  /** 서버가 보낸 장. 결제 전에는 앞 3장과 잠금 안내만 들어 있다 */
  pages: ViewerPage[];
  /** 책 전체 장 수(잠긴 장 포함). 진행률은 이 수를 기준으로 한다 */
  totalPages: number;
  price: string;
  /** 구매자 이메일. 있으면 장마다 옅게 표시한다 */
  watermark: string | null;
};

export default function BookViewer({ book, pages, totalPages, price, watermark }: Props) {
  const count = pages.length;
  const preview = pages[count - 1]?.type === "locked";
  const { ready, saved } = useSavedProgress(book.slug);
  const [index, setIndex] = useState<number | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const scroller = useRef<HTMLElement>(null);

  // 이어보기: 저장된 장에서 시작한다. 이미 끝까지 본 책이면 처음부터.
  const resumeAt = ready && saved && saved.last > 0 && saved.last < count - 1 ? saved.last : 0;
  const current = index ?? resumeAt;
  const page = pages[current];
  const longForm = page.type === "chapter";
  const seen = page.type === "locked" ? current : current + 1;
  const percent = Math.round((seen / totalPages) * 100);
  const detailHref = `/books/${book.slug}`;

  const go = useCallback(
    (to: number) => {
      const next = Math.min(Math.max(to, 0), count - 1);
      if (next === current && index !== null) return;
      setDir(next >= current ? 1 : -1);
      setIndex(next);
      if (scroller.current) scroller.current.scrollTop = 0;
      // 잠금 안내 화면은 읽은 장으로 치지 않는다
      if (pages[next].type !== "locked") saveProgress(book.slug, next, totalPages);
    },
    [book.slug, count, current, index, pages, totalPages],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(current + 1);
      if (e.key === "ArrowLeft") go(current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, current]);

  function onTouchStart(e: React.TouchEvent) {
    // 긴 글 장과 표 안에서는 좌우로 밀어도 장을 넘기지 않는다
    const inTable = (e.target as HTMLElement).closest?.("[data-noswipe]");
    touch.current = longForm || inTable ? null : { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }

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
    <ContentGuard detect={!preview}>
      <div style={style} className="flex min-h-dvh flex-col items-center justify-center bg-neutral-100 lg:gap-4 lg:p-6">
        <div
          className={`relative flex h-dvh w-full flex-col overflow-hidden bg-white lg:max-w-[1100px] lg:rounded-3xl lg:shadow-xl ${
            longForm ? "lg:h-[calc(100dvh-3rem)]" : "lg:aspect-video lg:h-auto"
          }`}
        >
          {/* 진행률 */}
          <header className="shrink-0 px-5 pt-3 lg:px-8 lg:pt-4">
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-neutral-600">
              <Link
                href={detailHref}
                className="-my-2 flex min-h-11 min-w-0 items-center gap-1 rounded pr-4 outline-offset-2 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-ink"
                aria-label={`${book.title}, 책 소개로 돌아가기`}
              >
                <span aria-hidden>←</span>
                <span className="truncate">{book.title}</span>
              </Link>
              <span className="shrink-0 tabular-nums">
                {page.type === "locked"
                  ? `전체 ${totalPages}장 중 ${current}장 무료`
                  : `${current + 1} / ${totalPages} · ${percent}%`}
              </span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-neutral-200"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={totalPages}
              aria-valuenow={seen}
              aria-label="읽은 진행률"
            >
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </header>

          {/* 장 */}
          <main
            ref={scroller}
            className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {ready && (
              <div
                key={current}
                className={`flex min-h-full flex-col ${dir === 1 ? "animate-in-next" : "animate-in-prev"}`}
              >
                {page.type === "chapter" ? (
                  <ChapterView page={page} />
                ) : page.type === "locked" ? (
                  <LockedView page={page} price={price} detailHref={detailHref} />
                ) : (
                  <SlideRenderer slide={page} />
                )}
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
            {page.type === "locked" ? (
              <span className="min-h-11" />
            ) : current === count - 1 ? (
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

          {watermark && <Watermark text={watermark} />}
        </div>
      </div>
    </ContentGuard>
  );
}
