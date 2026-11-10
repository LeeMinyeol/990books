"use client";

import { useRef, useState } from "react";

export default function PromptBox({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 클립보드 권한이 없을 때를 위한 대체 방법
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="rounded-2xl border-2 border-accent bg-accent-soft p-4 lg:p-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-accent">{label}</span>
        <button
          type="button"
          onClick={copy}
          className={`min-h-11 min-w-16 rounded-full px-4 text-sm font-bold transition-colors ${
            copied
              ? "animate-pop bg-neutral-900 text-white"
              : "bg-accent text-white active:scale-95"
          }`}
          aria-live="polite"
        >
          {copied ? "복사됨" : "복사"}
        </button>
      </div>
      <p className="text-[15px] leading-relaxed text-neutral-800 lg:text-base">
        {text}
      </p>
    </div>
  );
}
