import Link from "next/link";
import SoonButton from "./SoonButton";

type Section = "books" | "columns";

const MENU: { key: Section; href: string; label: string }[] = [
  { key: "books", href: "/", label: "전자책" },
  { key: "columns", href: "/columns", label: "오늘의 칼럼" },
];

function Nav({ className, current }: { className: string; current?: Section }) {
  return (
    <nav aria-label="주 메뉴" className={`type-label items-center gap-7 ${className}`}>
      {MENU.map((m) => (
        <Link
          key={m.key}
          href={m.href}
          aria-current={current === m.key ? "page" : undefined}
          className={`flex min-h-11 items-center rounded outline-offset-0 focus-visible:outline-2 focus-visible:outline-white ${
            current === m.key ? "text-white" : "text-white/70 hover:text-white"
          }`}
        >
          {m.label}
        </Link>
      ))}
    </nav>
  );
}

/** 사이트 공통 헤더. current는 지금 보고 있는 메뉴다 */
export default function SiteHeader({ current }: { current?: Section }) {
  return (
    <>
      <header className="sticky top-0 z-20 bg-header text-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-9 px-5 lg:h-16 lg:px-8">
          <Link
            href="/"
            className="type-heading flex min-h-11 items-center rounded outline-offset-0 focus-visible:outline-2 focus-visible:outline-white"
          >
            99BOOKS
          </Link>
          <Nav className="hidden sm:flex" current={current} />
          <span className="ml-auto">
            <SoonButton
              message="로그인은 준비 중이에요"
              className="type-label min-h-11 rounded-full bg-brand px-5 text-on-brand outline-offset-2 transition hover:brightness-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
            >
              로그인
            </SoonButton>
          </span>
        </div>
      </header>
      {/* 모바일에서는 메뉴를 헤더 아래 한 줄로 내린다(헤더와 달리 스크롤하면 올라간다) */}
      <div className="border-t border-white/10 bg-header px-5 text-white sm:hidden">
        <Nav className="flex h-11" current={current} />
      </div>
    </>
  );
}
