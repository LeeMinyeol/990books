"use client";

import { useEffect, useState, type ReactNode } from "react";

export type StepCardData = {
  no: number;
  title: string;
  action: ReactNode;
  visible: ReactNode;
  success: ReactNode[];
  trouble: ReactNode[];
  more: ReactNode | null;
};

/**
 * 단계 카드 묶음(docs/wireframe.md 3-9). 할 일·입력값·성공 확인만 보이고, 설명은 접힌 칸에 둔다.
 * 끝낸 단계는 브라우저 저장소에 남긴다(로그인 전까지). 저장이 막혀 있어도 화면은 그대로 쓴다.
 */
export default function StepList({ steps }: { steps: StepCardData[] }) {
  const [done, setDone] = useState<number[]>([]);
  const [key, setKey] = useState<string | null>(null);

  useEffect(() => {
    // 같은 장의 카드 묶음을 구분하는 열쇠: 주소 + 첫 카드 제목
    const k = `99books:steps:${location.pathname}:${steps[0]?.title ?? ""}`;
    let saved: number[] = [];
    try {
      saved = JSON.parse(localStorage.getItem(k) ?? "[]");
    } catch {
      saved = [];
    }
    const id = requestAnimationFrame(() => {
      setKey(k);
      setDone(Array.isArray(saved) ? saved : []);
    });
    return () => cancelAnimationFrame(id);
  }, [steps]);

  const toggle = (no: number) => {
    const next = done.includes(no) ? done.filter((n) => n !== no) : [...done, no];
    setDone(next);
    if (key) {
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // 저장이 막힌 브라우저: 화면에서만 체크된다
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 진행 표시는 카드를 내려도 화면 위에 붙어 따라온다 */}
      <p
        className="type-label sticky top-2 z-[2] self-end rounded-full border border-line bg-white/95 px-3 py-1 text-sub"
        aria-live="polite"
      >
        <span className="text-accent-ink tabular-nums">
          {done.length}/{steps.length}
        </span>{" "}
        단계
      </p>
      <ol className="flex flex-col gap-4">
        {steps.map((s) => {
          const checked = done.includes(s.no);
          return (
            <li
              key={s.no}
              className={`rounded-2xl border bg-white p-4 transition-colors lg:p-5 ${checked ? "border-accent" : "border-line"}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`type-label flex h-8 w-8 shrink-0 items-center justify-center rounded-full tabular-nums ${
                    checked ? "bg-accent text-on-accent" : "bg-panel text-ink"
                  }`}
                  aria-hidden
                >
                  {s.no}
                </span>
                <h3 className="type-title pt-0.5 text-ink">{s.title}</h3>
              </div>

              <div className="mt-3 flex flex-col gap-4">
                <p className="type-body font-bold text-ink">{s.action}</p>
                {s.visible}
                {s.success.map((t, i) => (
                  <p key={i} className="type-body rounded-xl border-l-4 border-accent bg-accent-soft px-4 py-3 text-ink">
                    <span className="type-label mr-2 text-accent-ink">성공</span>
                    {t}
                  </p>
                ))}
                {s.trouble.length > 0 && (
                  <Fold label="안 되면">
                    {s.trouble.map((t, i) => (
                      <p key={i} className="type-body text-ink">
                        {t}
                      </p>
                    ))}
                  </Fold>
                )}
                {s.more && <Fold label="더 알아보기">{s.more}</Fold>}
              </div>

              <label className="type-label mt-4 flex min-h-11 cursor-pointer items-center gap-3 border-t border-line pt-3 text-sub">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(s.no)}
                  className="h-5 w-5 shrink-0 accent-(--accent)"
                />
                이 단계를 했어요
              </label>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** 기본으로 닫힌 칸. 열지 않아도 끝까지 따라 할 수 있어야 한다 */
export function Fold({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="group rounded-xl bg-panel">
      <summary className="type-label flex min-h-11 cursor-pointer list-none items-center gap-2 px-4 text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink [&::-webkit-details-marker]:hidden">
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 6l6 6-6 6" />
        </svg>
        {label}
      </summary>
      <div className="flex flex-col gap-4 px-4 pb-4">{children}</div>
    </details>
  );
}
