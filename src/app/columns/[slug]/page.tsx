import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBook } from "@/books/content";
import { getColumn, getColumns } from "@/columns";
import Blocks from "@/components/content/Blocks";
import SiteFooter from "@/components/home/SiteFooter";
import SiteHeader from "@/components/home/SiteHeader";
import { KINDS, formatDate, formatPrice } from "@/lib/pricing";

export const instant = false;

export function generateStaticParams() {
  const slugs = getColumns().map((c) => ({ slug: c.slug }));
  // 공개된 글이 하나도 없으면 빌드가 멈춘다(빈 목록을 허용하지 않는다). 없는 글 주소 하나를 넣어 두면 그 주소는 404가 된다.
  return slugs.length > 0 ? slugs : [{ slug: "none" }];
}

export async function generateMetadata({ params }: PageProps<"/columns/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const column = getColumn(slug);
  return column ? { title: `${column.title} | 99BOOKS`, description: column.summary || undefined } : {};
}

/** 오늘의 칼럼 글. 무료 글이라 복사를 막지 않는다 */
export default async function ColumnPage({ params }: PageProps<"/columns/[slug]">) {
  const { slug } = await params;
  const column = getColumn(slug);
  if (!column) notFound();
  // 이어지는 책은 공개된 책일 때만 보여준다
  const book = column.book ? getBook(column.book) : undefined;
  const related = book && !book.draft ? book : undefined;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader current="columns" />
      <main className="mx-auto w-full max-w-[42.5rem] flex-1 px-5 pb-16 pt-10 lg:pt-14">
        <article>
          <Link
            href="/columns"
            className="type-label inline-flex min-h-11 items-center rounded text-brand-ink outline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ink"
          >
            오늘의 칼럼
          </Link>
          <h1 className="type-display mt-1 text-balance text-ink">{column.title}</h1>
          <p className="type-small mt-4 flex flex-wrap items-center gap-2 text-sub">
            {column.date && <span>{formatDate(column.date)}</span>}
            <span aria-hidden>·</span>
            <span>읽는 데 약 {column.minutes}분</span>
            {column.draft && <span className="type-caption rounded-full bg-ink px-2.5 py-1 text-white">검수 전</span>}
          </p>
          <div className="mt-8 border-t border-line pt-8">
            <Blocks blocks={column.blocks} />
          </div>
        </article>

        {related && (
          <aside className="mt-12 border-t border-line pt-8" aria-labelledby="related-title">
            <p id="related-title" className="type-label text-sub">
              이어지는 책
            </p>
            <Link
              href={`/books/${related.slug}`}
              className="mt-3 flex items-center justify-between gap-4 rounded-2xl border border-line p-5 outline-offset-2 transition hover:bg-panel focus-visible:outline-2 focus-visible:outline-ink"
            >
              <span>
                <span className="type-caption rounded-full bg-header px-2.5 py-1 text-white">{KINDS[related.kind].label}</span>
                <span className="type-title mt-2 block text-ink">{related.title}</span>
              </span>
              <span className="type-title shrink-0 text-ink">{formatPrice(KINDS[related.kind].price)} →</span>
            </Link>
          </aside>
        )}

        <Link
          href="/columns"
          className="type-label mt-10 inline-flex min-h-11 items-center rounded-full border-2 border-ink px-5 text-ink outline-offset-2 transition hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-ink"
        >
          ← 목록으로
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
