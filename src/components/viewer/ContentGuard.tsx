"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// 무단 배포를 어렵게 하는 가벼운 장치들. 뷰어에만 쓴다(오늘의 칼럼은 막지 않는다).
// 화면 캡처와 개발자도구는 웹에서 완전히 막을 수 없다. 속도를 떨어뜨리는 기법은 넣지 않는다.

const ACK_KEY = "99books:guard-ack";

/** 개발자도구, 소스 보기, 저장, 인쇄 단축키인가 */
function isBlockedShortcut(e: KeyboardEvent): boolean {
  const mod = e.ctrlKey || e.metaKey;
  if (e.key === "F12") return true;
  if (mod && e.shiftKey && ["KeyI", "KeyJ", "KeyC"].includes(e.code)) return true;
  if (e.metaKey && e.altKey && ["KeyI", "KeyJ", "KeyC", "KeyU"].includes(e.code)) return true;
  if (mod && !e.shiftKey && !e.altKey && ["KeyU", "KeyS", "KeyP"].includes(e.code)) return true;
  return false;
}

/**
 * 개발자도구가 창 옆이나 아래에 붙어 열렸는지 창 크기 비율로 어림한다.
 * 화면 확대는 가로·세로 비율을 같이 키우므로, 한쪽만 크게 벌어질 때만 열린 것으로 본다.
 * 브라우저 옆 패널 때문에 틀릴 수 있어서, 감지해도 안내만 하고 내용은 잠그지 않는다.
 */
function looksDocked(): boolean {
  const { outerWidth: ow, outerHeight: oh, innerWidth: iw, innerHeight: ih } = window;
  if (!ow || !oh || !iw || !ih) return false;
  const wr = ow / iw;
  const hr = oh / ih;
  return wr - hr > 0.12 || hr / wr > 1.6;
}

export default function ContentGuard({ children, detect }: { children: ReactNode; detect: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const okButton = useRef<HTMLButtonElement>(null);
  const [notice, setNotice] = useState(false);

  // 우클릭, 드래그, 복사, 단축키, 인쇄
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const stop = (e: Event) => e.preventDefault();
    const onKey = (e: KeyboardEvent) => {
      if (isBlockedShortcut(e)) e.preventDefault();
    };
    const events = ["contextmenu", "dragstart", "copy", "cut"] as const;
    events.forEach((name) => el.addEventListener(name, stop));
    window.addEventListener("keydown", onKey, true);
    // 인쇄 화면에는 내용 대신 안내 한 줄만 나온다(globals.css의 html.guarded)
    document.documentElement.classList.add("guarded");
    return () => {
      events.forEach((name) => el.removeEventListener(name, stop));
      window.removeEventListener("keydown", onKey, true);
      document.documentElement.classList.remove("guarded");
    };
  }, []);

  // 개발자도구 감지: 창 크기가 바뀔 때만 본다(주기적으로 돌리지 않는다)
  useEffect(() => {
    if (!detect) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let frame = 0;
    const check = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let acked = false;
        try {
          acked = sessionStorage.getItem(ACK_KEY) === "1";
        } catch {}
        if (!acked && looksDocked()) setNotice(true);
      });
    };
    check();
    window.addEventListener("resize", check);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", check);
    };
  }, [detect]);

  useEffect(() => {
    if (notice) okButton.current?.focus();
  }, [notice]);

  function dismiss() {
    try {
      sessionStorage.setItem(ACK_KEY, "1");
    } catch {}
    setNotice(false);
  }

  return (
    <div ref={root} className="guard">
      {children}
      {notice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-5">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="guard-title"
            aria-describedby="guard-desc"
            className="w-full max-w-sm rounded-3xl bg-white p-7 text-center"
          >
            <p id="guard-title" className="type-heading text-ink">
              이 책은 구매한 분만 볼 수 있어요
            </p>
            <p id="guard-desc" className="type-body mt-3 text-sub">
              장마다 구매자 이메일이 표시돼요. 내용을 복사해 다른 곳에 올리지 말아 주세요.
            </p>
            <button
              ref={okButton}
              type="button"
              onClick={dismiss}
              className="type-label mt-6 min-h-11 rounded-full bg-ink px-7 text-white outline-offset-2 transition active:scale-95 focus-visible:outline-2 focus-visible:outline-ink"
            >
              계속 보기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
