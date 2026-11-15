// 서버에서만 쓰는 파일이다(파일을 읽는다). 클라이언트 컴포넌트에서 불러오지 않는다.
// 책 한 권을 뷰어가 그리는 장 목록으로 바꾸고, 결제 전에는 앞 3장만 남긴다.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { FREE_PAGES, SHOW_DRAFTS } from "@/lib/access";
import { parseDoc } from "@/lib/blocks";
import type { Book, ChapterPage, LockedPage, ShelfItem, ViewerPage } from "@/lib/book";
import { comingBooks } from "./coming";
import { books } from "./index";

/** 공개 전 책은 개발 화면에서만 열린다 */
export function getBook(slug: string): Book | undefined {
  const book = books.find((b) => b.slug === slug);
  if (!book || (book.draft && !SHOW_DRAFTS)) return undefined;
  return book;
}

export function visibleBooks(): Book[] {
  return books.filter((b) => !b.draft || SHOW_DRAFTS);
}

/** 긴 글형 책의 챕터. 파일 이름 순서(01-, 02-)가 장 순서다 */
export function loadChapters(slug: string): ChapterPage[] {
  const dir = join(process.cwd(), "src", "books", slug, "chapters");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((file, i) => {
      const doc = parseDoc(readFileSync(join(dir, file), "utf8"));
      return {
        type: "chapter",
        no: i + 1,
        title: doc.title || file.replace(/^\d+-|\.md$/g, ""),
        blocks: doc.blocks,
        chars: doc.chars,
      };
    });
}

/** 장 전체. 챕터는 준비물 장 다음에 들어간다: 표지 → 준비물 → 챕터 → 핵심 단계 → 요약 → 다음편 */
export function allPages(book: Book): ViewerPage[] {
  const chapters = loadChapters(book.slug);
  if (chapters.length === 0) return book.slides;
  const at = book.slides[1]?.type === "checklist" ? 2 : 1;
  return [...book.slides.slice(0, at), ...chapters, ...book.slides.slice(at)];
}

/** 목차에 쓰는 장 이름 */
export function pageTitle(page: ViewerPage): string {
  switch (page.type) {
    case "cover":
      return "표지";
    case "checklist":
      return `준비물: ${page.title}`;
    case "step":
      return `STEP ${page.step}. ${page.title}`;
    case "chapter":
      return `CHAPTER ${page.no}. ${page.title}`;
    case "summary":
      return `요약: ${page.title}`;
    case "next":
      return "다음편 예고";
    case "locked":
      return "여기까지가 무료예요";
  }
}

/** 복사해 쓰는 입력값 수. 이름이 "입력값"으로 시작하는 박스만 센다("작성 예시"는 세지 않는다) */
export function countInputs(pages: ViewerPage[]): number {
  let n = 0;
  for (const p of pages) {
    if (p.type === "step" && p.prompt?.label.startsWith("입력값")) n++;
    if (p.type === "chapter") n += p.blocks.filter((b) => b.type === "prompt" && b.label.startsWith("입력값")).length;
  }
  return n;
}

/**
 * 뷰어에 보낼 장. 전체 권한이 없으면 앞 3장과 잠금 안내만 보낸다.
 * 잠긴 장의 내용은 브라우저로 가지 않는다(제목만 간다).
 */
export function viewerPages(book: Book, full: boolean): ViewerPage[] {
  const all = allPages(book);
  if (full || all.length <= FREE_PAGES) return all;
  const rest = all.slice(FREE_PAGES);
  const locked: LockedPage = {
    type: "locked",
    remaining: rest.length,
    outline: rest.map(pageTitle),
    inputs: countInputs(rest),
  };
  return [...all.slice(0, FREE_PAGES), locked];
}

function toShelfItem(book: Book): ShelfItem {
  const pages = allPages(book);
  const cover = book.slides.find((s) => s.type === "cover");
  const checklist = book.slides.find((s) => s.type === "checklist");
  const chapters = pages.filter((p) => p.type === "chapter").length;
  const inputs = countInputs(pages);
  return {
    slug: book.slug,
    title: book.title,
    category: book.category,
    summary: book.summary ?? cover?.subtitle ?? "",
    status: "open",
    kind: book.kind,
    topic: book.topic,
    includes: [
      chapters > 0
        ? book.kind === "deep" ? `읽는 챕터 ${chapters}개` : `따라 하며 읽는 챕터 ${chapters}개`
        : `따라 하기 슬라이드 ${book.slides.length}장`,
      ...(inputs > 0 ? [`복사해 쓰는 입력값 ${inputs}개`] : []),
      ...(book.files ?? []),
    ],
    writtenAt: checklist?.checkedAt,
    accent: book.accent,
    cover: book.cover ?? cover?.preview,
    tools: book.tools,
    extraCost: book.extraCost,
    minutes: book.minutes,
    slideCount: book.slides.length,
    chapterCount: chapters || undefined,
    rating: book.rating,
    draft: book.draft || undefined,
  };
}

/**
 * 홈 진열대: 공개된 책이 먼저, 준비 중인 책이 뒤에 온다.
 * 공개 전 책(draft)은 실제 서비스에서는 넣지 않고, 개발 화면에서만 공개된 책 뒤에 "공개 전" 배지를 달고 넣는다.
 */
export function getShelf(): ShelfItem[] {
  return [
    ...books.filter((b) => !b.draft).map(toShelfItem),
    ...(SHOW_DRAFTS ? books.filter((b) => b.draft).map(toShelfItem) : []),
    ...comingBooks.map((b): ShelfItem => ({ ...b, status: "coming" })),
  ];
}
