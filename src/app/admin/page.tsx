import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { isAdmin } from "@/lib/admin-auth";
import { getBookStatuses, getColumnStatuses, type BookStatus, type Check, type Review } from "@/lib/admin-status";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: "관리자 | 99BOOKS",
  robots: { index: false, follow: false },
};

/** 관리자 대시보드(와이어프레임 3-11). 요청마다 쿠키를 확인하므로 확인하는 부분은 Suspense 안에 둔다 */
export default function AdminPage() {
  return (
    <div className="min-h-screen bg-panel">
      <header className="bg-header text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <p className="type-title">99BOOKS 관리자</p>
          <Link href="/" className="type-small flex min-h-11 items-center rounded-full px-3 text-white/80 hover:text-white focus-visible:outline-2 focus-visible:outline-white">
            사이트 보기
          </Link>
        </div>
      </header>
      <Suspense fallback={<p className="type-small mx-auto max-w-6xl px-4 py-10 text-sub sm:px-6">관리자인지 확인하는 중이에요.</p>}>
        <Dashboard />
      </Suspense>
    </div>
  );
}

async function Dashboard() {
  if (!(await isAdmin())) redirect("/admin/login");

  const bookList = getBookStatuses();
  const columnList = getColumnStatuses();
  const published = bookList.filter((b) => !b.draft).length;
  const passed = bookList.filter((b) => b.review?.verdict === "합격").length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="type-heading text-ink">책·칼럼 현황</h1>
        <form action={logout}>
          <button
            type="submit"
            className="type-label min-h-11 rounded-full border border-line bg-white px-5 text-ink hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            로그아웃
          </button>
        </form>
      </div>
      <p className="type-body mt-3 text-sub">
        책 {bookList.length}권(공개 {published} · 공개 전 {bookList.length - published}) · 칼럼 {columnList.length}편 · 검수 합격 {passed}권
      </p>

      <section aria-labelledby="admin-books" className="mt-10">
        <h2 id="admin-books" className="type-title text-ink">
          책
        </h2>
        <p className="type-small mt-1 text-sub">장 수와 글자 수는 책 검사기와 같은 기준이에요. 공개 여부는 book.json의 draft로 바꿔요.</p>

        {/* 넓은 화면: 표 */}
        <div className="mt-4 hidden overflow-hidden rounded-2xl border border-line bg-white md:block">
          <table className="type-small w-full border-collapse text-left text-ink">
            <thead className="bg-panel">
              <tr>
                {["제목", "종류·가격", "공개", "분량", "출처", "검수"].map((h) => (
                  <th key={h} scope="col" className="whitespace-nowrap px-4 py-3 font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookList.map((b) => (
                <tr key={b.slug} className="border-t border-line align-top">
                  <td className="px-4 py-4">
                    <p className="font-bold">{b.title}</p>
                    <BookLinks slug={b.slug} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    {b.kindLabel}
                    <br />
                    <span className="text-sub">{b.price}</span>
                  </td>
                  <td className="px-4 py-4">
                    <Visibility draft={b.draft} />
                  </td>
                  <td className="px-4 py-4">
                    <Amount book={b} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">{b.sources}건</td>
                  <td className="px-4 py-4">
                    <ReviewCell review={b.review} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 좁은 화면: 카드 */}
        <ul className="mt-4 flex flex-col gap-3 md:hidden">
          {bookList.map((b) => (
            <li key={b.slug} className="rounded-2xl border border-line bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="type-label text-ink">{b.title}</p>
                <Visibility draft={b.draft} />
              </div>
              <dl className="type-small mt-3 grid grid-cols-[4.5rem_1fr] gap-x-3 gap-y-2 text-ink">
                <dt className="text-sub">종류·가격</dt>
                <dd>
                  {b.kindLabel} · {b.price}
                </dd>
                <dt className="text-sub">분량</dt>
                <dd>
                  <Amount book={b} />
                </dd>
                <dt className="text-sub">출처</dt>
                <dd>{b.sources}건</dd>
                <dt className="text-sub">검수</dt>
                <dd>
                  <ReviewCell review={b.review} />
                </dd>
              </dl>
              <BookLinks slug={b.slug} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="admin-columns" className="mt-12">
        <h2 id="admin-columns" className="type-title text-ink">
          오늘의 칼럼
        </h2>
        {columnList.length === 0 ? (
          <p className="type-small mt-3 text-sub">아직 칼럼이 없어요.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {columnList.map((c) => (
              <li key={c.slug} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-line bg-white p-5">
                <div className="min-w-0">
                  <p className="type-label text-ink">{c.title}</p>
                  <p className="type-small mt-1 text-sub">
                    {c.date}
                    {c.book ? ` · 이어지는 책: ${c.book}` : ""}
                  </p>
                  <div className="type-small mt-2">
                    <ReviewCell review={c.review} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Visibility draft={c.draft} />
                  <Link href={`/columns/${c.slug}`} className="type-small flex min-h-11 items-center font-bold text-ink underline underline-offset-4">
                    글 보기
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function BookLinks({ slug }: { slug: string }) {
  return (
    <p className="type-small mt-2 flex gap-4">
      <Link href={`/books/${slug}`} className="flex min-h-11 items-center font-bold text-ink underline underline-offset-4">
        상세
      </Link>
      <Link href={`/books/${slug}/read`} className="flex min-h-11 items-center font-bold text-ink underline underline-offset-4">
        뷰어
      </Link>
    </p>
  );
}

function Visibility({ draft }: { draft: boolean }) {
  return draft ? (
    <span className="type-caption inline-block whitespace-nowrap rounded-full bg-panel px-3 py-1 font-bold text-sub">공개 전</span>
  ) : (
    <span className="type-caption inline-block whitespace-nowrap rounded-full bg-header px-3 py-1 font-bold text-white">공개</span>
  );
}

function CheckText({ check, unit }: { check: Check; unit: string }) {
  return (
    <span>
      {check.value.toLocaleString()}
      {unit} {check.ok ? "✓" : "✗"}
      {check.rule && <span className="text-sub"> (기준 {check.rule})</span>}
    </span>
  );
}

function Amount({ book }: { book: BookStatus }) {
  return (
    <span className="flex flex-col gap-1">
      <CheckText check={book.units} unit={book.format === "chapters" ? "장" : "장(슬라이드)"} />
      {book.chars && <CheckText check={book.chars} unit="자" />}
    </span>
  );
}

function ReviewCell({ review }: { review: Review | null }) {
  if (!review) return <span className="text-sub">검수 전</span>;
  return (
    <span>
      <span className="font-bold">{review.verdict}</span> <span className="text-sub">{review.date}</span>
      <br />
      <span className="text-sub">{review.file}</span>
    </span>
  );
}
