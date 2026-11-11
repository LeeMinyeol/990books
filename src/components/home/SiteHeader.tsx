import Link from "next/link";
import SoonButton from "./SoonButton";

function Nav({ className }: { className: string }) {
  return (
    <nav aria-label="주 메뉴" className={`type-label items-center gap-7 ${className}`}>
      <Link
        href="/"
        aria-current="page"
        className="flex min-h-11 items-center rounded outline-offset-0 focus-visible:outline-2 focus-visible:outline-white"
      >
        전자책
      </Link>
      {/* 오늘의 칼럼은 글이 생기면 링크로 바꾼다 */}
      <span className="flex items-center gap-1.5 text-white/60">
        오늘의 칼럼
        <span className="type-caption rounded bg-white/15 px-1.5 py-0.5 text-white/80">준비 중</span>
      </span>
    </nav>
  );
}

export default function SiteHeader() {
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
          <Nav className="hidden sm:flex" />
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
        <Nav className="flex h-11" />
      </div>
    </>
  );
}
