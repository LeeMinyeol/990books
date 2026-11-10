"use client";

import Link from "next/link";
import { useRef, useState } from "react";

export default function SiteHeader() {
  const [notice, setNotice] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // 로그인 기능을 붙이기 전까지는 안내만 보여준다
  function onLogin() {
    setNotice(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(false), 2400);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 lg:h-16 lg:px-8">
        <Link
          href="/"
          className="font-title text-2xl leading-none text-ink outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink"
        >
          99BOOKS
        </Link>
        <div className="relative">
          <button
            type="button"
            onClick={onLogin}
            className="min-h-11 rounded-full bg-ink px-5 text-sm font-bold text-white outline-offset-2 transition hover:bg-neutral-700 active:scale-95 focus-visible:outline-2 focus-visible:outline-ink"
          >
            로그인
          </button>
          <p
            role="status"
            className={`absolute right-0 top-full mt-2 whitespace-nowrap rounded-lg bg-ink px-3 py-2 text-sm text-white ${
              notice ? "" : "hidden"
            }`}
          >
            {notice ? "로그인은 준비 중이에요" : ""}
          </p>
        </div>
      </div>
    </header>
  );
}
