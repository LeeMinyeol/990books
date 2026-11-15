import type { Book } from "@/lib/book";
import instaMonth from "./insta-month/book.json";
import sampleDeep from "./sample-deep/book.json";
import claudeCodeStart from "./claude-code-start/book.json";
import aiWorkInsight from "./ai-work-insight/book.json";

// 새 책은 JSON 파일을 만들고 여기에 한 줄만 추가하면 된다.
// 화면에서 쓸 때는 content.ts의 getBook, getShelf, viewerPages를 쓴다(공개 전 책과 잠금을 거기서 처리한다).
export const books: Book[] = [
  instaMonth as unknown as Book, sampleDeep as unknown as Book, claudeCodeStart as unknown as Book,
  aiWorkInsight as unknown as Book,
];
