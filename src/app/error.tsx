"use client";

import Link from "next/link";

/** 화면을 그리다 문제가 났을 때. 기술 용어 없이 다시 시도할 길을 준다 */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[42.5rem] flex-col justify-center px-5 py-16">
      <h1 className="type-display text-balance text-ink">화면을 불러오지 못했어요</h1>
      <p className="type-body mt-4 text-sub">잠깐 연결이 끊겼거나 페이지에 문제가 생겼어요. 다시 시도해도 같으면 잠시 뒤에 들어와 주세요.</p>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <button
          type="button"
          onClick={() => reset()}
          className="type-label inline-flex min-h-12 items-center rounded-full bg-brand px-6 text-on-brand outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="type-label inline-flex min-h-11 items-center rounded text-ink underline-offset-4 outline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ink"
        >
          홈으로 →
        </Link>
      </div>
    </main>
  );
}
