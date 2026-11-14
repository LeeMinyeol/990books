"use client";

import { useRef, useState, type ReactNode } from "react";

/** 아직 기능이 없는 버튼. 누르면 안내 문구를 잠깐 보여준다 */
export default function SoonButton({
  children,
  message,
  className,
  align = "right",
  up = false,
  wrapperClassName = "",
}: {
  children: ReactNode;
  message: string;
  className: string;
  align?: "left" | "right";
  /** 안내를 버튼 위쪽에 띄운다(화면 아래 고정 바에서 쓴다) */
  up?: boolean;
  /** 버튼을 감싼 틀에 붙일 클래스(버튼을 옆 버튼과 같은 너비로 늘릴 때 쓴다) */
  wrapperClassName?: string;
}) {
  const [shown, setShown] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function onClick() {
    setShown(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShown(false), 2400);
  }

  return (
    <span className={`relative inline-flex ${wrapperClassName}`}>
      <button type="button" onClick={onClick} className={className}>
        {children}
      </button>
      <span
        role="status"
        className={`type-small absolute z-30 whitespace-nowrap rounded-lg bg-header px-3 py-2 text-white ${
          up ? "bottom-full mb-2" : "top-full mt-2"
        } ${
          align === "right" ? "right-0" : "left-0"
        } ${shown ? "" : "hidden"}`}
      >
        {shown ? message : ""}
      </span>
    </span>
  );
}
