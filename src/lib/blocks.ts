// 긴 글(긴 글형 책 챕터, 오늘의 칼럼)을 화면용 블록으로 바꾼다.
// 글은 마크다운 파일로 쓰고, 서버가 이 변환을 거쳐 블록만 보낸다.
// 지원하는 것: # 제목, ## 소제목, ### 단계 제목, 문단, **굵게**, 목록, 번호 목록,
// 점검표(- [ ]), 표, 이미지, 인용, 입력값 박스(```입력값 1).
// 맨 위에 "layout: cards"를 적은 챕터는 "### 1. 동작" 단계를 카드(step)로 묶는다(docs/wireframe.md 3-9).

import type { ImageRef } from "./book";

export type Block =
  | { type: "h2"; text: string; id: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "check"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "prompt"; label: string; text: string }
  | { type: "image"; image: ImageRef }
  | { type: "quote"; text: string }
  | StepBlock;

/**
 * 단계 카드. 첫 문단이 할 일이고, 입력값·그림·번호 목록·점검표는 카드에 그대로 보인다.
 * "성공:"으로 시작하는 문단은 성공 확인, "안 되면:"은 접힌 칸, 나머지 설명은 "더 알아보기" 접힌 칸으로 간다.
 */
export type StepBlock = {
  type: "step";
  no: number;
  title: string;
  action: string;
  visible: Block[];
  success: string[];
  trouble: string[];
  more: Block[];
};

/** "### 1. 동작" 제목과 그 아래 블록을 카드로 묶는다 */
function groupSteps(blocks: Block[]): Block[] {
  const out: Block[] = [];
  let card: StepBlock | null = null;
  for (const b of blocks) {
    const m = b.type === "h3" ? b.text.match(/^(\d+)\.\s*(.+)$/) : null;
    if (m) {
      card = { type: "step", no: Number(m[1]), title: m[2], action: "", visible: [], success: [], trouble: [], more: [] };
      out.push(card);
      continue;
    }
    if (b.type === "h2" || b.type === "h3") card = null;
    if (!card) {
      out.push(b);
      continue;
    }
    if (b.type === "p") {
      if (/^성공:\s*/.test(b.text)) card.success.push(b.text.replace(/^성공:\s*/, ""));
      else if (/^안 되면:\s*/.test(b.text)) card.trouble.push(b.text.replace(/^안 되면:\s*/, ""));
      else if (!card.action) card.action = b.text;
      else card.more.push(b);
    } else if (b.type === "prompt" || b.type === "image" || b.type === "ol" || b.type === "check") card.visible.push(b);
    else card.more.push(b);
  }
  return out;
}

export type ParsedDoc = {
  /** 맨 위 "# 제목" 줄. 없으면 빈 문자열 */
  title: string;
  /** 맨 위 --- 사이에 적은 값 (key: value) */
  meta: Record<string, string>;
  blocks: Block[];
  /** 공백을 뺀 본문 글자 수 (입력값 박스는 세지 않는다) */
  chars: number;
};

const cells = (line: string) =>
  line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());

export function parseDoc(raw: string): ParsedDoc {
  let text = raw.replace(/\r\n/g, "\n");
  const meta: Record<string, string> = {};
  const fm = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (fm) {
    for (const line of fm[1].split("\n")) {
      const m = line.match(/^([A-Za-z]+):\s*(.*)$/);
      if (m) meta[m[1]] = m[2].trim();
    }
    text = text.slice(fm[0].length);
  }

  const lines = text.split("\n");
  const blocks: Block[] = [];
  let title = "";
  let chars = 0;
  let h2Count = 0;
  let i = 0;
  const count = (s: string) => {
    chars += s.replace(/\s/g, "").length;
  };

  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();
    if (!t) {
      i++;
      continue;
    }

    // 입력값 박스: 울타리 첫 줄에 이름을 적는다. 이름이 없으면 "작성 예시"
    if (t.startsWith("```")) {
      const label = t.slice(3).trim() || "작성 예시";
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) body.push(lines[i++]);
      i++;
      blocks.push({ type: "prompt", label, text: body.join("\n").trim() });
      continue;
    }

    if (t.startsWith("# ")) {
      if (!title) title = t.slice(2).trim();
      i++;
      continue;
    }
    if (t.startsWith("## ")) {
      const text = t.slice(3).trim();
      blocks.push({ type: "h2", text, id: `s${++h2Count}` });
      count(text);
      i++;
      continue;
    }
    if (t.startsWith("### ")) {
      const text = t.slice(4).trim();
      blocks.push({ type: "h3", text });
      count(text);
      i++;
      continue;
    }

    const img = t.match(/^!\[([^\]]*)\]\(([^)]*)\)$/);
    if (img) {
      blocks.push({ type: "image", image: { alt: img[1], src: img[2] || undefined } });
      i++;
      continue;
    }

    // 표: 머리 줄 다음 줄이 |---|---| 모양일 때
    if (t.startsWith("|") && /^\|?[\s:|-]+\|?$/.test(lines[i + 1]?.trim() ?? "") && lines[i + 1].includes("-")) {
      const head = cells(t);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(cells(lines[i++]));
      blocks.push({ type: "table", head, rows });
      count(head.join("") + rows.flat().join(""));
      continue;
    }

    const list = (pattern: RegExp) => {
      const items: string[] = [];
      while (i < lines.length && pattern.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(pattern, "").trim());
        i++;
      }
      count(items.join(""));
      return items;
    };
    if (/^[-*] \[[ xX]\] /.test(t)) {
      blocks.push({ type: "check", items: list(/^[-*] \[[ xX]\] /) });
      continue;
    }
    if (/^[-*] /.test(t)) {
      blocks.push({ type: "ul", items: list(/^[-*] /) });
      continue;
    }
    if (/^\d+\. /.test(t)) {
      blocks.push({ type: "ol", items: list(/^\d+\. /) });
      continue;
    }
    if (t.startsWith("> ")) {
      const body: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) body.push(lines[i++].trim().slice(2));
      blocks.push({ type: "quote", text: body.join(" ") });
      count(body.join(""));
      continue;
    }

    // 문단: 빈 줄이나 다른 블록이 나올 때까지 이어 붙인다
    const para: string[] = [];
    while (i < lines.length) {
      const s = lines[i].trim();
      if (!s || /^(#{1,3} |```|[-*] |\d+\. |> |\||!\[)/.test(s)) break;
      para.push(s);
      i++;
    }
    blocks.push({ type: "p", text: para.join(" ") });
    count(para.join(""));
  }

  return { title, meta, blocks: meta.layout === "cards" ? groupSteps(blocks) : blocks, chars };
}
