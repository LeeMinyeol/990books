"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * 모바일 아래 고정 버튼 바. 첫 화면의 버튼(id="hero-cta")이 화면에 보이는 동안에는 숨긴다.
 * 같은 버튼이 한 화면에 두 번 보이지 않게 하려는 것(QA 2026-11-16, ISSUE-002).
 * 첫 화면 버튼을 지나 내려가면 나타난다. 숨어 있을 때는 키보드 초점도 받지 않는다.
 */
export default function MobileBuyBar({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const target = document.getElementById("hero-cta");
    // 첫 화면 버튼이 없는 페이지면 처음부터 보여 준다
    if (!target || typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setShow(true));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(([entry]) => setShow(!entry.isIntersecting), { threshold: 0 });
    io.observe(target);
    return () => io.disconnect();
  }, []);

  return (
    <div
      inert={!show}
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white px-4 py-3 transition-transform duration-200 motion-reduce:transition-none lg:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {children}
    </div>
  );
}
