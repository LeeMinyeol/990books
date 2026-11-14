import type { Metadata } from "next";
import Link from "next/link";
import { getColumns } from "@/columns";
import SiteFooter from "@/components/home/SiteFooter";
import SiteHeader from "@/components/home/SiteHeader";
import { formatDate } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "오늘의 칼럼 | 99BOOKS",
  description: "최근 이슈와 트렌드를 쉽게 풀어 쓴 무료 글",
};

/** 오늘의 칼럼 목록. 최신 글이 위에 온다 */
export default function ColumnsPage() {
  const columns = getColumns();
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader current="columns" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-16 pt-10 lg:px-8 lg:pt-14">
        <h1 className="type-display text-ink">오늘의 칼럼</h1>
        <p className="type-body mt-3 text-sub">최근 이슈와 트렌드를 쉽게 풀어 쓴 무료 글이에요.</p>

        {columns.length === 0 ? (
          <p className="type-body mt-12 text-sub">첫 글을 준비하고 있어요.</p>
        ) : (
          <ul className="mt-8 border-t border-line">
            {columns.map((c) => (
              <li key={c.slug} className="border-b border-line">
                <Link
                  href={`/columns/${c.slug}`}
                  className="group block rounded-xl py-7 outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink"
                >
                  <p className="type-small flex flex-wrap items-center gap-2 text-sub">
                    {c.date && <span>{formatDate(c.date)}</span>}
                    <span aria-hidden>·</span>
                    <span>읽는 데 약 {c.minutes}분</span>
                    {c.draft && <span className="type-caption rounded-full bg-ink px-2.5 py-1 text-white">검수 전</span>}
                  </p>
                  <h2 className="type-heading mt-2 text-balance text-ink underline-offset-4 group-hover:underline">{c.title}</h2>
                  {c.summary && <p className="type-body mt-2 text-sub">{c.summary}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
