import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/home/SiteFooter";
import SiteHeader from "@/components/home/SiteHeader";

export const metadata: Metadata = {
  title: "찾는 페이지가 없어요 | 99BOOKS",
  robots: { index: false },
};

/** 없는 주소. 이유를 짐작할 수 있게 쓰고, 갈 곳 두 군데를 준다 */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[42.5rem] flex-1 flex-col justify-center px-5 py-16">
        <h1 className="type-display text-balance text-ink">찾는 페이지가 없어요</h1>
        <p className="type-body mt-4 text-sub">주소가 바뀌었거나, 아직 공개하지 않은 책일 수 있어요.</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/"
            className="type-label inline-flex min-h-12 items-center rounded-full bg-brand px-6 text-on-brand outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
          >
            홈으로
          </Link>
          <Link
            href="/columns"
            className="type-label inline-flex min-h-11 items-center rounded text-ink underline-offset-4 outline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ink"
          >
            오늘의 칼럼 보기 →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
