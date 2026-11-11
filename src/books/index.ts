import type { Book, ShelfItem } from "@/lib/book";
import { comingBooks } from "./coming";
import instaMonth from "./insta-month/book.json";

// 새 책은 JSON 파일을 만들고 여기에 한 줄만 추가하면 된다.
export const books: Book[] = [instaMonth as unknown as Book];

export function getBook(slug: string): Book | undefined {
  return books.find((b) => b.slug === slug);
}

function toShelfItem(book: Book): ShelfItem {
  const cover = book.slides.find((s) => s.type === "cover");
  const checklist = book.slides.find((s) => s.type === "checklist");
  // "입력값 N" 박스만 센다. "작성 예시" 박스는 복사해 쓰는 것이 아니라서 세지 않는다
  const inputs = book.slides.filter((s) => s.type === "step" && s.prompt?.label.startsWith("입력값")).length;
  return {
    slug: book.slug,
    title: book.title,
    category: book.category,
    summary: book.summary ?? cover?.subtitle ?? "",
    status: "open",
    kind: book.kind,
    topic: book.topic,
    includes: [
      `따라 하기 슬라이드 ${book.slides.length}장`,
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
    rating: book.rating,
  };
}

/** 홈 진열대: 공개된 책이 먼저, 준비 중인 책이 뒤에 온다 */
export const shelf: ShelfItem[] = [
  ...books.map(toShelfItem),
  ...comingBooks.map((b): ShelfItem => ({ ...b, status: "coming" })),
];
