"use client";

import { useMemo, useSyncExternalStore } from "react";

// 이어보기·완독 기록은 로그인 붙이기 전까지 브라우저 저장소에 둔다.
export type SavedProgress = { last: number; completed: boolean };

const EVENT = "990books:progress";
const keyOf = (slug: string) => `990books:v1:${slug}`;

function readRaw(slug: string): string {
  try {
    return localStorage.getItem(keyOf(slug)) ?? "";
  } catch {
    return "";
  }
}

function parse(raw: string): SavedProgress | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    if (typeof v.last === "number") {
      return { last: v.last, completed: Boolean(v.completed) };
    }
  } catch {}
  return null;
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

/** ready=false 는 서버 렌더·하이드레이션 중(저장값을 아직 모르는 상태) */
export function useSavedProgress(slug: string) {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(slug),
    () => null,
  );
  return useMemo(
    () => ({ ready: raw !== null, saved: raw ? parse(raw) : null }),
    [raw],
  );
}

export function saveProgress(slug: string, last: number, total: number) {
  const prev = parse(readRaw(slug));
  const next: SavedProgress = {
    last,
    completed: Boolean(prev?.completed) || last === total - 1,
  };
  try {
    localStorage.setItem(keyOf(slug), JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  } catch {}
}

export function clearProgress(slug: string) {
  try {
    localStorage.removeItem(keyOf(slug));
    window.dispatchEvent(new Event(EVENT));
  } catch {}
}
