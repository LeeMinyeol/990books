// 사이트 안내 페이지(소개, 이용 안내)의 글. 글은 같은 폴더의 .md 파일이고, 서버에서 읽어 화면 블록으로 바꾼다.
// 문체 검사: node scripts/style-check.mjs src/site/<이름>.md --type page
// 가격이 바뀌면 about.md, guide.md의 금액도 같이 고친다(src/lib/pricing.ts).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseDoc, type ParsedDoc } from "@/lib/blocks";

export type SitePage = "about" | "guide";

export function getSitePage(name: SitePage): ParsedDoc {
  return parseDoc(readFileSync(join(process.cwd(), "src", "site", `${name}.md`), "utf8"));
}
