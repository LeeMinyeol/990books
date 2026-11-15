import Image from "next/image";
import type { CSSProperties } from "react";
import type { ShelfItem } from "@/lib/book";
import { KINDS } from "@/lib/pricing";

/**
 * 세로 책 표지(3:4). 서점 베스트셀러 표지의 구조를 따른다(docs/image-style.md 10).
 * 대상 한 줄 → 큰 제목(한 줄만 형광펜) → 약속 한 줄 → 상징 → 사실 스티커 → 아래 출판사 띠.
 * 표지 폭에 따라 덜어 낸다: 200px 미만이면 약속·스티커를, 180px 미만이면 띠의 종류 이름을, 150px 미만이면 상징과 띠를, 140px 미만이면 대상 한 줄을 뺀다.
 * 글자 크기는 표지 폭에 비례하되 13px보다 작아지지 않는다. 굵기는 800(제목)·700(작은 글) 두 가지만 쓴다.
 * 표지 속 글은 꾸밈이라 화면 읽기 도구에는 숨긴다. 카드나 링크가 제목을 따로 읽힌다.
 */
export default function BookJacket({ item, sizes }: { item: ShelfItem; sizes: string }) {
  const kind = item.kind ? KINDS[item.kind].label : null;
  const style = {
    "--accent": item.accent ?? "#ff6a33",
    "--on-accent": item.onAccent ?? "#1c1c1c",
  } as CSSProperties;
  const j = item.jacket;
  const lines = j?.title ?? [item.title];
  const motif = j?.motif ?? (item.cover?.src ? "plate" : "none");
  const plate = motif === "plate" ? item.cover?.src : undefined;

  // 그림 표지가 있으면 그림 위에 책등 그림자만 얹는다. 표지 속 글은 그림에 들어 있다
  if (j?.image) {
    return (
      <div
        aria-hidden
        className="relative aspect-[3/4] w-full overflow-hidden rounded-l-[3px] rounded-r-[10px] bg-panel shadow-[0_14px_28px_-14px_rgba(20,20,20,0.5),0_2px_4px_rgba(20,20,20,0.12)]"
      >
        <Image src={j.image} alt="" fill sizes={sizes} className="object-cover" />
        <span className="absolute inset-y-0 left-0 w-[4%] bg-gradient-to-r from-black/25 to-transparent" />
        <span className="absolute inset-y-0 left-[4%] w-px bg-white/40" />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      style={style}
      className="@container relative aspect-[3/4] w-full overflow-hidden rounded-l-[3px] rounded-r-[10px] bg-accent text-on-accent shadow-[0_14px_28px_-14px_rgba(20,20,20,0.5),0_2px_4px_rgba(20,20,20,0.12)]"
    >
      {/* 책등: 왼쪽 띠와 접힌 자리의 밝은 선 */}
      <span className="absolute inset-y-0 left-0 w-[7%] bg-black/20" />
      <span className="absolute inset-y-0 left-[7%] w-px bg-white/30" />

      {/* 위에서 아래로: 글 → 상징 칸(남은 높이만 쓴다) → 출판사 띠. 상징이 글을 덮지 않는다 */}
      <div className="absolute inset-y-0 left-[7%] right-0 flex flex-col">
        <div className="px-[9%] pt-[10%]">
          {j?.hook && (
            <span className="font-title hidden @[140px]:block" style={{ fontSize: "max(13px, 5.2cqw)", letterSpacing: "-0.01em" }}>
              {j.hook}
            </span>
          )}
          <span
            className={`font-title line-clamp-4 block ${j?.hook ? "@[140px]:mt-[3%]" : ""}`}
            style={{ fontSize: `max(14px, ${j ? 12 : 10.5}cqw)`, lineHeight: 1.16, letterSpacing: "-0.03em" }}
          >
            {lines.map((line, i) =>
              i === j?.mark ? (
                // 형광펜: 흰 바탕에 진한 포인트색 글자(흰 바탕 위 accent-ink 4.5:1을 palette.json에서 확인한 조합)
                <span key={i} className="block">
                  <span className="rounded-[0.12em] bg-white px-[0.12em] text-accent-ink [box-decoration-break:clone]">{line}</span>
                </span>
              ) : (
                <span key={i} className="block">
                  {line}
                </span>
              ),
            )}
          </span>
          {j?.promise && (
            <span className="mt-[5%] hidden font-bold opacity-90 @[200px]:block" style={{ fontSize: "max(13px, 4.4cqw)", lineHeight: 1.4 }}>
              {j.promise}
            </span>
          )}
        </div>

        <div className="relative min-h-0 flex-1">
          {/* 상징: 표지 그림 판. 남은 칸 안에서만 커진다 */}
          {plate && (
            <div className="absolute inset-x-[9%] bottom-[10%] top-[10%] hidden items-end justify-center @[150px]:flex">
              <div className="relative aspect-[16/10] max-h-full w-[94%] -rotate-3 overflow-hidden rounded-md bg-white shadow-[0_8px_16px_-6px_rgba(20,20,20,0.45)]">
                <Image src={plate} alt="" fill sizes={sizes} unoptimized={plate.endsWith(".svg")} className="object-cover" />
              </div>
            </div>
          )}

          {/* 상징: 울퉁불퉁한 경계선(인사이트 책) */}
          {motif === "jagged" && (
            <svg viewBox="0 0 100 46" className="absolute bottom-[12%] left-[9%] right-[9%] hidden @[150px]:block" fill="none">
              <polyline
                points="0,30 10,22 18,34 27,12 36,26 44,8 53,30 62,18 70,36 79,14 88,24 100,6"
                className="stroke-on-accent"
                strokeWidth="2.2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <circle cx="27" cy="12" r="3.2" className="fill-on-accent" />
              <circle cx="53" cy="30" r="3.2" className="fill-white stroke-on-accent" strokeWidth="1.6" />
              <circle cx="79" cy="14" r="3.2" className="fill-on-accent" />
            </svg>
          )}

          {/* 사실 스티커: 상징 칸의 오른쪽 위 */}
          {j?.sticker && j.sticker.length > 0 && (
            <span
              className="absolute right-[5%] top-0 hidden aspect-square w-[27%] rotate-[8deg] flex-col items-center justify-center rounded-full bg-white text-center text-accent-ink shadow-[0_6px_12px_-6px_rgba(20,20,20,0.45)] @[200px]:flex"
              style={{ fontSize: "max(13px, 4cqw)", lineHeight: 1.15 }}
            >
              {j.sticker.map((s, i) => (
                <span key={i} className={i === 1 ? "font-title" : "font-bold"} style={i === 1 ? { fontSize: "1.45em" } : undefined}>
                  {s}
                </span>
              ))}
            </span>
          )}
        </div>

        {/* 출판사 띠: 150px부터. 종류 이름은 180px부터 */}
        <div
          className="hidden h-[9%] shrink-0 items-center justify-between border-t border-white/25 px-[9%] @[150px]:flex"
          style={{ fontSize: "max(13px, 3.6cqw)" }}
        >
          <span className="hidden font-bold opacity-90 @[180px]:inline">{kind}</span>
          <span className="font-title ml-auto tracking-tight">99BOOKS</span>
        </div>
      </div>
    </div>
  );
}
