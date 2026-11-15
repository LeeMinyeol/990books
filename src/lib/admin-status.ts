// 관리자 대시보드에 보여줄 책·칼럼 현황. 서버에서만 쓴다(파일을 읽는다).
// 장 수·글자 수 기준은 scripts/book-check.mjs 와 같다. 기준을 바꿀 때는 두 곳을 함께 고친다.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { books } from "@/books";
import { getAllColumns } from "@/columns";
import type { BookKind } from "@/lib/book";
import { KINDS, formatPrice } from "@/lib/pricing";

const ROOT = process.cwd();
const BOOKS_DIR = join(ROOT, "src", "books");
const REVIEWS_DIR = join(ROOT, "reviews");

export type Check = { value: number; ok: boolean; rule: string };

export type Review = { verdict: "합격" | "불합격" | "작성 중"; date: string; file: string };

export type BookStatus = {
  slug: string;
  title: string;
  kindLabel: string;
  price: string;
  draft: boolean;
  format: "slide" | "chapters";
  /** 긴 글형은 챕터 수, 슬라이드형은 슬라이드 수 */
  units: Check;
  /** 긴 글형만: 챕터 합계 글자 수(공백 제외) */
  chars: Check | null;
  sources: number;
  review: Review | null;
};

export type ColumnStatus = {
  slug: string;
  title: string;
  date: string;
  draft: boolean;
  book?: string;
  review: Review | null;
};

const RANGES: Record<BookKind, { chapters?: [number, number]; chars?: [number, number]; slides?: [number, number] }> = {
  mini: { chapters: [3, 7], chars: [8000, 25000], slides: [10, 15] },
  kit: { slides: [25, 40] },
  deep: { chapters: [5, 7], chars: [15000, 25000] },
};

const inRange = (n: number, [lo, hi]: [number, number]) => n >= lo && n <= hi;
const rangeText = ([lo, hi]: [number, number], unit: string) => `${lo.toLocaleString()}~${hi.toLocaleString()}${unit}`;

/** reviews/<이름>-YYYY-MM-DD.md 중 가장 최근 것의 판정 */
function latestReview(name: string): Review | null {
  if (!existsSync(REVIEWS_DIR)) return null;
  const files = readdirSync(REVIEWS_DIR)
    .filter((f) => new RegExp(`^${name}-\\d{4}-\\d{2}-\\d{2}\\.md$`).test(f))
    .sort();
  const file = files.at(-1);
  if (!file) return null;
  const text = readFileSync(join(REVIEWS_DIR, file), "utf8");
  const m = text.match(/판정:\s*(합격|불합격)\*\*/);
  return {
    verdict: m ? (m[1] as "합격" | "불합격") : "작성 중",
    date: file.slice(name.length + 1, -3),
    file: `reviews/${file}`,
  };
}

function countSources(slug: string): number {
  const path = join(BOOKS_DIR, slug, "sources.md");
  if (!existsSync(path)) return 0;
  return readFileSync(path, "utf8")
    .split("\n")
    .filter((line) => /^\|\s*\d+\s*\|/.test(line)).length;
}

export function getBookStatuses(): BookStatus[] {
  return books.map((book) => {
    const dir = join(BOOKS_DIR, book.slug, "chapters");
    const chapterFiles = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".md")) : [];
    const range = RANGES[book.kind];
    const isChapters = chapterFiles.length > 0 && Boolean(range.chapters);

    let units: Check;
    let chars: Check | null = null;
    if (isChapters && range.chapters && range.chars) {
      const total = chapterFiles.reduce((n, f) => n + readFileSync(join(dir, f), "utf8").replace(/\s/g, "").length, 0);
      units = { value: chapterFiles.length, ok: inRange(chapterFiles.length, range.chapters), rule: rangeText(range.chapters, "장") };
      chars = { value: total, ok: inRange(total, range.chars), rule: rangeText(range.chars, "자") };
    } else {
      const slides = book.slides.length;
      const r = range.slides ?? [0, Infinity];
      units = { value: slides, ok: inRange(slides, r as [number, number]), rule: range.slides ? rangeText(range.slides, "장") : "" };
    }

    return {
      slug: book.slug,
      title: book.title,
      kindLabel: KINDS[book.kind].label,
      price: formatPrice(KINDS[book.kind].price),
      draft: Boolean(book.draft),
      format: isChapters ? "chapters" : "slide",
      units,
      chars,
      sources: countSources(book.slug),
      review: latestReview(book.slug),
    };
  });
}

export function getColumnStatuses(): ColumnStatus[] {
  return getAllColumns().map((c) => ({
    slug: c.slug,
    title: c.title,
    date: c.date,
    draft: c.draft,
    book: c.book,
    review: latestReview(c.slug),
  }));
}
