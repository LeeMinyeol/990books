import Link from "next/link";
import { getShelf } from "@/books/content";
import { getColumns } from "@/columns";
import BookShelf from "@/components/home/BookShelf";
import HeroCarousel from "@/components/home/HeroCarousel";
import SiteFooter from "@/components/home/SiteFooter";
import SiteHeader from "@/components/home/SiteHeader";
import { formatDate } from "@/lib/pricing";

/** 홈에 보여주는 최근 칼럼 수 */
const HOME_COLUMNS = 3;

export default function Home() {
  const shelf = getShelf();
  const columns = getColumns().slice(0, HOME_COLUMNS);
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader current="books" />
      <main className="flex-1">
        <h1 className="sr-only">99BOOKS, 따라 하면 결과물 하나가 나오는 웹 전자책</h1>
        <HeroCarousel items={shelf.filter((item) => item.status === "open")} />
        <BookShelf items={shelf} />

        {/* 오늘의 칼럼: 글이 있을 때만 보인다 */}
        {columns.length > 0 && (
          <section aria-labelledby="home-columns" className="border-t border-line">
            <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
              <div className="flex items-end justify-between gap-4">
                <h2 id="home-columns" className="type-heading text-ink">
                  오늘의 칼럼
                </h2>
                <Link
                  href="/columns"
                  className="type-label flex min-h-11 items-center rounded text-brand-ink outline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ink"
                >
                  전체 보기 →
                </Link>
              </div>
              <ul className="mt-4 grid gap-x-6 gap-y-2 lg:grid-cols-3">
                {columns.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/columns/${c.slug}`}
                      className="group block rounded-2xl border border-line p-5 outline-offset-2 transition hover:bg-panel focus-visible:outline-2 focus-visible:outline-ink"
                    >
                      <p className="type-small text-sub">
                        {c.date ? `${formatDate(c.date)} · ` : ""}읽는 데 약 {c.minutes}분
                        {c.draft && <span className="type-caption ml-2 rounded-full bg-ink px-2.5 py-1 text-white">검수 전</span>}
                      </p>
                      <h3 className="type-title mt-2 text-balance text-ink underline-offset-4 group-hover:underline">{c.title}</h3>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
