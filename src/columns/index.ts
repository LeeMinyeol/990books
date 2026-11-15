// 서버에서만 쓰는 파일이다(파일을 읽는다).
// 오늘의 칼럼은 이 폴더의 <slug>.md 파일이다. 맨 위에 아래 값을 적는다.
//
// ---
// title: 글 제목 (없으면 본문의 "# 제목" 줄을 쓴다)
// date: 2026-11-13
// summary: 목록에 보이는 요약 한두 문장
// book: 이어지는 책의 slug (내용이 실제로 이어질 때만. 없으면 줄을 지운다)
// draft: true (검수 전이면 적는다. 개발 화면에서만 보인다)
// ---

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { SHOW_DRAFTS } from "@/lib/access";
import { parseDoc, type Block } from "@/lib/blocks";

/** 읽는 시간 어림: 공백을 뺀 글자 수를 1분에 500자로 나눈다 */
const CHARS_PER_MINUTE = 500;

export type Column = {
  slug: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  summary: string;
  /** 이어지는 책의 slug */
  book?: string;
  draft: boolean;
  minutes: number;
  blocks: Block[];
};

const DIR = join(process.cwd(), "src", "columns");

function load(file: string): Column {
  const doc = parseDoc(readFileSync(join(DIR, file), "utf8"));
  return {
    slug: file.replace(/\.md$/, ""),
    title: doc.meta.title || doc.title,
    date: doc.meta.date ?? "",
    summary: doc.meta.summary ?? "",
    book: doc.meta.book || undefined,
    draft: doc.meta.draft === "true",
    minutes: Math.max(1, Math.round(doc.chars / CHARS_PER_MINUTE)),
    blocks: doc.blocks,
  };
}

/** 최신 글이 먼저. 검수 전 글은 개발 화면에서만 나온다 */
export function getColumns(): Column[] {
  if (!existsSync(DIR)) return [];
  return readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map(load)
    .filter((c) => !c.draft || SHOW_DRAFTS)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** 검수 전 글까지 모두. 관리자 화면에서만 쓴다 */
export function getAllColumns(): Column[] {
  if (!existsSync(DIR)) return [];
  return readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map(load)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getColumn(slug: string): Column | undefined {
  return getColumns().find((c) => c.slug === slug);
}
