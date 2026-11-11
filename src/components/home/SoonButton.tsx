"use client";

import { useRef, useState, type ReactNode } from "react";

/** 아직 기능이 없는 버튼. 누르면 안내 문구를 잠깐 보여준다 */
export default function SoonButton({
  children,
  message,
  className,
  align = "right",
}: {
  children: ReactNode;
  message: string;
  className: string;
  align?: "left" | "right";
}) {
  const [shown, setShown] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function onClick() {
    setShown(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShown(false), 2400);
  }

  return (
    <span className="relative inline-flex">
      <button type="button" onClick={onClick} className={className}>
        {children}
      </button>
      <span
        role="status"
        className={`type-small absolute top-full z-30 mt-2 whitespace-nowrap rounded-lg bg-header px-3 py-2 text-white ${
          align === "right" ? "right-0" : "left-0"
        } ${shown ? "" : "hidden"}`}
      >
        {shown ? message : ""}
      </span>
    </span>
  );
}
