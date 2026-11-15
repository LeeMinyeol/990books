import Link from "next/link";

const LINKS = [
  { href: "/about", label: "소개" },
  { href: "/guide", label: "이용 안내" },
  { href: "/columns", label: "오늘의 칼럼" },
];

/** 사이트 공통 바닥글: 이름, 한 줄 소개, 안내 페이지 링크 */
export default function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-end sm:justify-between lg:px-8">
        <div className="flex flex-col gap-1">
          <span className="type-title text-ink">99BOOKS</span>
          <span className="type-small text-sub">필요한 만큼만 읽는 작은 웹 책방</span>
        </div>
        <nav aria-label="안내" className="-mx-2 flex flex-wrap">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="type-small inline-flex min-h-11 items-center rounded px-2 text-sub underline-offset-4 outline-offset-0 hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
