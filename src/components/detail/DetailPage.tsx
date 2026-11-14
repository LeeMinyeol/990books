import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { allPages, countInputs, pageTitle } from "@/books/content";
import { books } from "@/books";
import Blocks from "@/components/content/Blocks";
import SiteFooter from "@/components/home/SiteFooter";
import SiteHeader from "@/components/home/SiteHeader";
import SoonButton from "@/components/home/SoonButton";
import SlideRenderer from "@/components/viewer/SlideRenderer";
import { FREE_PAGES } from "@/lib/access";
import type { Book, DetailBlock, DetailSpec, ImageRef, ViewerPage } from "@/lib/book";
import { PAYMENT_SOON, REFUND_LINES, REFUND_SHORT } from "@/lib/policy";
import { KINDS, formatDate, formatPrice } from "@/lib/pricing";

/** 후기는 이 개수 이상일 때부터 보여준다 */
const MIN_REVIEWS = 3;

/** detail이 없는 책에 쓰는 기본 구성 */
const DEFAULT_SPEC: DetailSpec = {
  recipe: "A",
  blocks: [
    { type: "hero", variant: "split", lead: "" },
    { type: "preview", title: "앞 3장을 먼저 보세요" },
    { type: "toc", title: "전체 목차" },
    { type: "facts", title: "작성 시점과 사용한 도구" },
    { type: "refund", title: "환불 안내" },
  ],
};

type Ctx = {
  book: Book;
  pages: ViewerPage[];
  price: string;
  kindLabel: string;
  cover?: ImageRef;
  meta: string[];
  readHref: string;
};

function Check() {
  return (
    <svg viewBox="0 0 20 20" className="h-6 w-6 shrink-0" aria-hidden>
      <circle cx="10" cy="10" r="10" className="fill-accent" />
      <path d="m5.5 10.2 3 3 6-6.4" fill="none" className="stroke-on-accent" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Lock() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-sub" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

/** 버튼 두 개. 문구는 모든 책이 같다. onAccent는 포인트컬러 바탕 위에 놓을 때 */
function Cta({ ctx, onAccent = false, compact = false, up = false }: { ctx: Ctx; onAccent?: boolean; compact?: boolean; up?: boolean }) {
  // compact는 모바일 아래 고정 바: 두 버튼이 한 줄을 반씩 나눠 쓴다
  const size = compact ? "min-h-11 flex-1 justify-center px-2" : "min-h-13 px-7";
  return (
    <div className={compact ? "flex w-full gap-2" : "flex flex-wrap gap-3"}>
      <Link
        href={ctx.readHref}
        className={`type-label flex items-center rounded-full outline-offset-2 transition hover:brightness-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-ink ${size} ${
          onAccent ? "bg-header text-white" : "bg-accent text-on-accent"
        }`}
      >
        앞 {FREE_PAGES}장 무료로 보기
      </Link>
      <SoonButton
        align="left"
        up={up}
        wrapperClassName={compact ? "flex-1" : ""}
        message={PAYMENT_SOON}
        className={`type-label rounded-full border-2 outline-offset-2 transition active:scale-95 focus-visible:outline-2 focus-visible:outline-ink ${size} ${
          onAccent ? "border-on-accent text-on-accent" : "border-ink text-ink hover:bg-ink hover:text-white"
        } ${compact ? "w-full" : ""}`}
      >
        전체 보기 {ctx.price}
      </SoonButton>
    </div>
  );
}

function CoverImage({ image, sizes, priority = false }: { image: ImageRef; sizes: string; priority?: boolean }) {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-panel">
      {image.src && (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={image.src.endsWith(".svg")}
          className="object-cover"
        />
      )}
    </div>
  );
}

function Hero({ ctx, block }: { ctx: Ctx; block: Extract<DetailBlock, { type: "hero" }> }) {
  const { book, cover } = ctx;
  // 표지 이미지가 없으면 포인트컬러 바탕(band)으로 그린다
  const variant = cover?.src ? block.variant : "band";
  const band = variant === "band";
  const lead = block.lead || book.summary || "";

  const text = (
    <div>
      <p className="flex flex-wrap items-center gap-2.5">
        <span className={`type-caption rounded-full px-3 py-1 ${band ? "bg-on-accent text-accent" : "bg-header text-white"}`}>
          {ctx.kindLabel}
        </span>
        <span className={`type-label ${band ? "" : "text-sub"}`}>{[book.category, book.topic].filter(Boolean).join(", ")}</span>
      </p>
      <h1 className="type-display mt-4 text-balance">{book.title}</h1>
      {lead && <p className={`type-body mt-4 max-w-2xl ${band ? "" : "text-sub"}`}>{lead}</p>}
      <p className={`type-small mt-4 ${band ? "" : "text-sub"}`}>{ctx.meta.join(" · ")}</p>
      <div className="mt-7">
        <Cta ctx={ctx} onAccent={band} />
      </div>
      <p className={`type-small mt-3 ${band ? "" : "text-sub"}`}>{REFUND_SHORT}</p>
    </div>
  );

  if (band) {
    return (
      <section className="bg-accent text-on-accent">
        <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8 lg:py-20">{text}</div>
      </section>
    );
  }
  if (variant === "stack") {
    return (
      <section>
        {/* 글을 먼저 보여주고 그 아래에 이미지를 크게 둔다(제목과 버튼이 첫 화면에 들어오게) */}
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-8 lg:gap-12 lg:px-8 lg:py-14">
          {text}
          <CoverImage image={cover!} sizes="(min-width: 1024px) 960px, 100vw" priority />
        </div>
      </section>
    );
  }
  return (
    <section>
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:px-8 lg:py-16">
        <div className="lg:order-last">
          <CoverImage image={cover!} sizes="(min-width: 1024px) 560px, 100vw" priority />
        </div>
        {text}
      </div>
    </section>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-14">
        <h2 className="type-heading flex items-center gap-3 text-ink">
          <span className="h-6 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
          {title}
        </h2>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

/** 앞 3장을 실제 장 그대로 그린다. 챕터는 앞부분만 보여주고 뷰어로 잇는다 */
function PagePreview({ page }: { page: ViewerPage }) {
  if (page.type === "chapter") {
    return (
      <div className="relative max-h-[30rem] overflow-hidden px-6 py-8 lg:px-12">
        <p className="type-label text-accent-ink">CHAPTER {page.no}</p>
        <p className="type-display mt-2 text-ink">{page.title}</p>
        <div className="mt-6 max-w-[42.5rem]">
          <Blocks blocks={page.blocks.slice(0, 6)} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" aria-hidden />
      </div>
    );
  }
  if (page.type === "locked") return null;
  return <SlideRenderer slide={page} preview />;
}

function BlockView({ ctx, block }: { ctx: Ctx; block: DetailBlock }) {
  const { book, pages } = ctx;
  switch (block.type) {
    case "hero":
      return <Hero ctx={ctx} block={block} />;

    case "outcome":
      return (
        <Section title={block.title}>
          <div className="grid items-center gap-6 lg:grid-cols-[1.4fr_1fr] lg:gap-10">
            <CoverImage image={block.image} sizes="(min-width: 1024px) 560px, 100vw" />
            <p className="type-body text-ink">{block.caption}</p>
          </div>
        </Section>
      );

    case "includes":
      return (
        <Section title={block.title}>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {block.items.map((it) => (
              <li key={it.name} className="flex gap-3 rounded-2xl border border-line p-5">
                <Check />
                <div>
                  <p className="type-title text-ink">{it.name}</p>
                  <p className="type-small mt-1 text-sub">{it.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      );

    case "for-whom":
      return (
        <Section title={block.title}>
          <ul className="flex flex-col gap-3">
            {block.items.map((it) => (
              <li key={it} className="type-body flex items-center gap-3 rounded-2xl bg-panel px-5 py-4 text-ink">
                <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />
                {it}
              </li>
            ))}
          </ul>
        </Section>
      );

    case "problem":
      return (
        <Section title={block.title}>
          <p className="type-body max-w-3xl text-ink">{block.body}</p>
        </Section>
      );

    case "before-after":
      return (
        <Section title={block.title}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-panel p-6">
              <p className="type-label text-sub">따라 하기 전</p>
              <p className="type-body mt-2 text-ink">{block.before}</p>
            </div>
            <div className="rounded-2xl border-2 border-accent bg-accent-soft p-6">
              <p className="type-label text-accent-ink">따라 한 뒤</p>
              <p className="type-body mt-2 text-ink">{block.after}</p>
            </div>
          </div>
        </Section>
      );

    case "steps":
      return (
        <Section title={block.title}>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {block.items.map((it, i) => (
              <li key={it.name} className="rounded-2xl bg-accent-soft p-5">
                <span className="type-heading text-accent-ink tabular-nums">{i + 1}</span>
                <p className="type-title mt-2 text-ink">{it.name}</p>
                <p className="type-small mt-1 text-sub">{it.desc}</p>
              </li>
            ))}
          </ol>
        </Section>
      );

    case "toc":
      return (
        <Section title={block.title}>
          {/* 2단일 때 번호가 위에서 아래로 이어지게 한다 */}
          <ol className="gap-x-10 lg:columns-2">
            {pages.map((p, i) => (
              <li key={i} className="type-body flex min-h-11 break-inside-avoid items-center gap-3 border-b border-line py-2 text-ink">
                <span className="type-label w-6 shrink-0 text-sub tabular-nums">{i + 1}</span>
                <span className="flex-1">{pageTitle(p)}</span>
                {i < FREE_PAGES ? (
                  <span className="type-caption shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-accent-ink">무료</span>
                ) : (
                  <>
                    <Lock />
                    <span className="sr-only">결제 후 볼 수 있어요</span>
                  </>
                )}
              </li>
            ))}
          </ol>
        </Section>
      );

    case "preview":
      return (
        <Section title={block.title}>
          <ol className="flex flex-col gap-6">
            {pages.slice(0, FREE_PAGES).map((p, i) => (
              <li key={i}>
                <p className="type-caption mb-2 text-sub tabular-nums">
                  {i + 1} / {pages.length}
                </p>
                <div className="flex min-h-64 flex-col overflow-hidden rounded-3xl border border-line bg-white lg:min-h-96">
                  <PagePreview page={p} />
                </div>
              </li>
            ))}
          </ol>
          <Link
            href={ctx.readHref}
            className="type-label mt-6 inline-flex min-h-11 items-center gap-1 rounded-full border-2 border-ink px-5 text-ink outline-offset-2 transition hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-ink"
          >
            뷰어에서 넘겨 보기 →
          </Link>
        </Section>
      );

    case "faq":
      return (
        <Section title={block.title}>
          <div className="flex flex-col">
            {block.items.map((it) => (
              <details key={it.q} className="group border-b border-line">
                <summary className="type-title flex min-h-13 cursor-pointer list-none items-center justify-between gap-4 py-2 text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink [&::-webkit-details-marker]:hidden">
                  {it.q}
                  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <p className="type-body pb-5 text-sub">{it.a}</p>
              </details>
            ))}
          </div>
        </Section>
      );

    case "facts": {
      const checklist = book.slides.find((s) => s.type === "checklist");
      const chapters = pages.filter((p) => p.type === "chapter");
      const inputs = countInputs(pages);
      const size =
        chapters.length > 0
          ? `챕터 ${chapters.length}개, 글 약 ${(Math.round(chapters.reduce((n, c) => n + c.chars, 0) / 100) * 100).toLocaleString("ko-KR")}자`
          : `슬라이드 ${book.slides.length}장`;
      const rows: [string, ReactNode][] = [
        ["종류", ctx.kindLabel],
        ...(checklist?.type === "checklist" ? ([["작성 시점", formatDate(checklist.checkedAt)]] as [string, ReactNode][]) : []),
        [
          "사용한 도구",
          checklist?.type === "checklist" ? (
            <ul className="flex flex-col gap-1">
              {checklist.items.map((it) => (
                <li key={it.label}>
                  {it.label} <span className="text-sub">({it.note})</span>
                </li>
              ))}
            </ul>
          ) : (
            book.tools
          ),
        ],
        ["추가 비용", checklist?.type === "checklist" ? checklist.totalCost : book.extraCost],
        ["분량", inputs > 0 ? `${size}, 복사해 쓰는 입력값 ${inputs}개` : size],
        ["걸리는 시간", `${book.minutes}분`],
      ];
      return (
        <Section title={block.title}>
          <dl className="type-body grid grid-cols-[6.5rem_1fr] gap-x-4 text-ink">
            {rows.map(([k, v]) => (
              <div key={k} className="col-span-2 grid grid-cols-subgrid border-b border-line py-3">
                <dt className="type-label text-sub">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="type-small mt-4 text-sub">도구 화면과 요금제는 작성 시점 기준이에요. 그 뒤에 바뀐 내용은 책에 반영되지 않을 수 있어요.</p>
        </Section>
      );
    }

    case "refund":
      return (
        <Section title={block.title}>
          <ul className="type-body flex flex-col gap-2 text-ink">
            {REFUND_LINES.map((line) => (
              <li key={line} className="flex gap-3">
                <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
        </Section>
      );

    case "reviews": {
      // 후기 본문 데이터는 아직 없다. 승인된 후기가 3개 이상 쌓이면 평점만 보여준다
      const rating = book.rating && book.rating.count >= MIN_REVIEWS ? book.rating : null;
      if (!rating) return null;
      return (
        <Section title={block.title}>
          <p className="type-body text-ink">
            완독한 독자 {rating.count}명의 평점은 {rating.average.toFixed(1)}점이에요.
          </p>
        </Section>
      );
    }

    case "next": {
      // 이어지는 책이 공개돼 있을 때만 그린다
      const next = book.slides.find((s) => s.type === "next");
      const target = next?.type === "next" ? books.find((b) => !b.draft && b.title === next.title) : undefined;
      if (!target || next?.type !== "next") return null;
      return (
        <Section title={block.title}>
          <Link
            href={`/books/${target.slug}`}
            className="flex flex-col gap-1 rounded-2xl border border-line p-5 outline-offset-2 transition hover:bg-panel focus-visible:outline-2 focus-visible:outline-ink"
          >
            <span className="type-title text-ink">{target.title}</span>
            <span className="type-small text-sub">{next.teaser}</span>
          </Link>
        </Section>
      );
    }
  }
}

/** 책 상세페이지. book.json의 detail.blocks를 위에서부터 차례로 그린다 */
export default function DetailPage({ book }: { book: Book }) {
  const pages = allPages(book);
  const kind = KINDS[book.kind];
  const coverSlide = book.slides.find((s) => s.type === "cover");
  const checklist = book.slides.find((s) => s.type === "checklist");
  const chapters = pages.filter((p) => p.type === "chapter").length;
  const ctx: Ctx = {
    book,
    pages,
    price: formatPrice(kind.price),
    kindLabel: kind.label,
    cover: book.cover ?? (coverSlide?.type === "cover" ? coverSlide.preview : undefined),
    meta: [
      `${book.minutes}분`,
      chapters > 0 ? `챕터 ${chapters}개` : `슬라이드 ${book.slides.length}장`,
      `추가 비용 ${book.extraCost}`,
      ...(checklist?.type === "checklist" ? [`${formatDate(checklist.checkedAt)} 작성`] : []),
    ],
    readHref: `/books/${book.slug}/read`,
  };
  const spec = book.detail ?? DEFAULT_SPEC;
  const style = { "--accent": book.accent, "--on-accent": book.onAccent ?? "#fff" } as CSSProperties;

  return (
    <div style={style} className="flex min-h-dvh flex-col">
      <SiteHeader current="books" />
      {book.draft && (
        <p className="type-caption bg-ink px-5 py-2 text-center text-white">공개 전 책이에요. 개발 화면에서만 보여요.</p>
      )}
      <main className="flex-1">
        {spec.blocks.map((block, i) => (
          <BlockView key={`${block.type}-${i}`} ctx={ctx} block={block} />
        ))}
        {/* 맺음 구역: 끝까지 읽은 사람에게 버튼을 한 번 더 */}
        <section className="border-t border-line bg-panel">
          <div className="mx-auto flex max-w-5xl flex-col gap-5 px-5 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-12">
            <div>
              <p className="type-heading text-balance text-ink">{book.title}</p>
              <p className="type-small mt-2 text-sub">
                {ctx.kindLabel} · {ctx.price} · {REFUND_SHORT}
              </p>
            </div>
            <div className="hidden shrink-0 lg:block">
              <Cta ctx={ctx} />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      {/* 모바일: 아래 고정 버튼 바. 본문이 가려지지 않게 같은 높이의 빈칸을 둔다 */}
      <div className="h-20 lg:hidden" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white px-4 py-3 lg:hidden">
        <Cta ctx={ctx} compact up />
      </div>
    </div>
  );
}
