import Image from "next/image";
import type { ReactNode } from "react";
import type { ImageRef, Slide } from "@/lib/book";
import PromptBox from "./PromptBox";

/** **굵게** 표기만 지원하는 가벼운 렌더러 */
function Rich({ text }: { text: string }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") ? (
      <strong key={i} className="font-extrabold text-neutral-950">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}

function ImageSlot({ image, className = "" }: { image: ImageRef; className?: string }) {
  return (
    <div
      className={`relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-dashed border-accent/50 bg-accent-soft ${className}`}
    >
      {image.src ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          unoptimized={image.src.endsWith(".svg")}
          className="object-cover"
          draggable={false}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1 px-6 text-center">
          <span className="text-xs font-bold tracking-wider text-accent-ink">
            스크린샷 자리 · 16:10
          </span>
          <span className="text-sm text-neutral-500">{image.alt}</span>
        </div>
      )}
    </div>
  );
}

function Body({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full flex-1 max-w-5xl flex-col justify-center gap-6 px-6 py-6 lg:px-14 lg:py-8">
      {children}
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="animate-lock h-8 w-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function Stamp() {
  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return (
    <div
      className="animate-stamp pointer-events-none absolute right-4 top-4 flex h-24 w-24 flex-col items-center justify-center rounded-full border-4 border-accent text-accent-ink lg:right-10 lg:top-8 lg:h-28 lg:w-28"
      role="img"
      aria-label="완독 스탬프"
    >
      <span className="font-title text-2xl leading-none lg:text-3xl">완독</span>
      <span className="mt-1 text-[10px] font-bold">{today}</span>
    </div>
  );
}

/**
 * 슬라이드형 장 하나를 그린다.
 * preview는 상세페이지의 "앞 3장" 안에 넣을 때 쓴다(제목 태그를 한 단계 낮추고 완독 스탬프를 빼낸다).
 */
export default function SlideRenderer({ slide, preview = false }: { slide: Slide; preview?: boolean }) {
  const H1 = preview ? "p" : "h1";
  const H2 = preview ? "h3" : "h2";
  switch (slide.type) {
    case "cover":
      return (
        <Body>
          <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col gap-4">
              <span className="text-sm font-bold text-accent-ink">99BOOKS</span>
              <H1 className="font-title text-[1.9rem] leading-tight text-neutral-950 lg:text-5xl lg:leading-[1.2]">
                {slide.title}
              </H1>
              <p className="text-base text-neutral-600 lg:text-lg">{slide.subtitle}</p>
              <ul className="flex flex-wrap gap-2">
                {slide.chips.map((c) => (
                  <li
                    key={c}
                    className="rounded-full bg-accent-soft px-3 py-1 text-sm font-bold text-accent-ink"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <ImageSlot image={slide.preview} />
          </div>
        </Body>
      );

    case "checklist":
      return (
        <Body>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-accent-ink">준비물 체크</span>
            <H2 className="font-title text-3xl text-neutral-950 lg:text-4xl">{slide.title}</H2>
          </div>
          <ul className="flex flex-col gap-3">
            {slide.items.map((it) => (
              <li
                key={it.label}
                className="flex items-center gap-4 rounded-2xl border border-neutral-200 px-4 py-3 lg:px-6 lg:py-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                </span>
                <span className="flex flex-col">
                  <span className="text-base font-bold text-neutral-900 lg:text-lg">{it.label}</span>
                  <span className="text-sm text-neutral-500">{it.note}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-neutral-500">
            예상 비용 <b className="text-neutral-900">{slide.totalCost}</b> · 최종 확인일 {slide.checkedAt}
          </p>
        </Body>
      );

    case "step":
      return (
        <Body>
          <div className={`grid items-center gap-6 ${slide.image ? "lg:grid-cols-2 lg:gap-12" : ""}`}>
            {slide.image && <ImageSlot image={slide.image} className="lg:order-first" />}
            <div className="flex flex-col gap-4">
              <span className="text-sm font-bold text-accent-ink">STEP {slide.step}</span>
              <H2 className="font-title text-3xl leading-tight text-neutral-950 lg:text-4xl">
                {slide.title}
              </H2>
              <p className="text-lg leading-relaxed text-neutral-700 lg:text-xl">
                <Rich text={slide.text} />
              </p>
              {slide.prompt && <PromptBox label={slide.prompt.label} text={slide.prompt.text} />}
            </div>
          </div>
        </Body>
      );

    case "summary":
      return (
        <Body>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-accent-ink">요약</span>
            <H2 className="font-title text-3xl text-neutral-950 lg:text-4xl">{slide.title}</H2>
          </div>
          <ol className="flex flex-col gap-3">
            {slide.points.map((p, i) => (
              <li key={p} className="flex items-center gap-4 rounded-2xl bg-accent-soft px-4 py-3 lg:px-6 lg:py-4">
                <span className="font-title text-2xl text-accent-ink">{i + 1}</span>
                <span className="text-base font-bold text-neutral-900 lg:text-lg">{p}</span>
              </li>
            ))}
          </ol>
        </Body>
      );

    case "next":
      return (
        <>
          {!preview && <Stamp />}
          <Body>
            <span className="text-sm font-bold text-accent-ink">다음편 예고</span>
            <div className="relative flex flex-col gap-4 overflow-hidden rounded-3xl border-2 border-accent p-6 lg:p-10">
              <div className="animate-shine pointer-events-none absolute inset-0" aria-hidden />
              <div className="flex items-center gap-3 text-accent-ink">
                <LockIcon />
                <span className="text-sm font-bold">잠겨 있어요</span>
              </div>
              <H2 className="font-title text-2xl leading-tight text-neutral-950 lg:text-4xl">
                {slide.title}
              </H2>
              <p className="text-base text-neutral-600 lg:text-lg">{slide.teaser}</p>
              <div className="flex items-center gap-3">
                <span className="font-title text-2xl text-neutral-950">{slide.price}</span>
                <button
                  type="button"
                  disabled
                  className="rounded-full bg-neutral-200 px-5 py-2 text-sm font-bold text-neutral-500"
                >
                  결제 연결 전이에요
                </button>
              </div>
            </div>
          </Body>
        </>
      );
  }
}
