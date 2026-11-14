#!/usr/bin/env node
// 상세페이지 구성 검사기. 규칙의 설명은 .claude/skills/detail-page/SKILL.md 에 있다.
//
// 사용법: node scripts/detail-check.mjs <slug>
// 불합격(✗)이 하나라도 있으면 종료 코드 1.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { BANNED, PLACEHOLDER, countEmoji, scanPhrases } from "./lib/text.mjs";

const slug = process.argv[2];
if (!slug) {
  console.error("사용법: node scripts/detail-check.mjs <slug>");
  process.exit(2);
}

const palette = JSON.parse(readFileSync("src/lib/palette.json", "utf8")).colors;
const load = (s) => JSON.parse(readFileSync(join("src", "books", s, "book.json"), "utf8"));
const book = load(slug);
const others = readdirSync(join("src", "books"), { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== slug && existsSync(join("src", "books", d.name, "book.json")))
  .map((d) => load(d.name));

const results = [];
const add = (level, label, value, rule) => results.push({ level, label, value, rule });
const check = (ok, label, value, rule) => add(ok ? "ok" : "fail", label, value, rule);

// 틀마다 정해진 블록 순서. 조건부 블록은 빠질 수 있지만 순서는 바뀌지 않는다
const TAIL = ["facts", "faq", "refund", "reviews", "next"];
const RECIPE_ORDER = {
  A: ["hero", "outcome", "includes", "steps", "preview", "toc", "before-after", ...TAIL],
  B: ["hero", "for-whom", "problem", "before-after", "includes", "preview", "toc", ...TAIL],
  C: ["hero", "steps", "includes", "for-whom", "preview", "toc", ...TAIL],
  D: ["hero", "for-whom", "toc", "includes", "preview", "before-after", "problem", ...TAIL],
};
// 틀마다 빠질 수 없는 블록 (조건부 블록을 뺀 나머지)
const RECIPE_REQUIRED = {
  A: ["hero", "outcome", "includes", "steps", "preview", "toc", "facts", "faq", "refund"],
  B: ["hero", "for-whom", "problem", "before-after", "includes", "preview", "toc", "facts", "faq", "refund"],
  C: ["hero", "steps", "includes", "for-whom", "preview", "toc", "facts", "faq", "refund"],
  D: ["hero", "for-whom", "toc", "includes", "preview", "facts", "faq", "refund"],
};
// 상세페이지에만 있는 금지 표현 (공통 금지 표현에 더한다)
const SALES_BANNED = [
  { re: /마감 ?임박|남은 ?(자리|수량)|오늘만|한정 ?수량|선착순|곧 ?가격 ?(인상|상승)/g, why: "긴급성 장치 금지" },
  { re: /(?<!\d)1위|베스트셀러|필독서|상위 ?\d+ ?%|누적 ?\d+[^.\n]{0,8}(판매|수강)/g, why: "근거를 댈 수 없는 배지·순위 금지" },
  { re: /정가|\d+ ?% ?할인|원 ?상당/g, why: "정가를 부풀려 할인처럼 보이게 하는 표현 금지" },
];
const sentences = (t) => t.split(/(?<=[.!?…])\s+/).filter((s) => s.trim().length > 1);

// ── 색 ──
const color = palette.find((c) => c.accent.toLowerCase() === String(book.accent).toLowerCase());
check(Boolean(color), "포인트컬러", book.accent, "src/lib/palette.json 의 색 중 하나");
if (color) check((book.onAccent ?? "#FFFFFF").toLowerCase() === color.onAccent.toLowerCase(), "색 위 글자색", book.onAccent ?? "(없음)", `${color.name} 색은 ${color.onAccent}`);
const sameCat = others.filter((o) => o.category === book.category);
if (sameCat.length < palette.length) {
  const clash = sameCat.find((o) => String(o.accent).toLowerCase() === String(book.accent).toLowerCase());
  check(!clash, "같은 분야 색 겹침", clash ? `${clash.slug}와 같은 색` : "없음", "같은 분야의 책끼리 색이 겹치지 않는다");
}

// 책 본문에 채우지 않은 자리가 남아 있으면 상세페이지를 만들 단계가 아니다
const leftover = JSON.stringify(book.slides).match(PLACEHOLDER);
check(!leftover, "책 본문 준비", leftover ? `"${leftover[0]}"가 남아 있음` : "됨", "준비물 장 등에 채우지 않은 자리가 있으면 전자책 제작 스킬로 돌아가 먼저 채운다");

// ── 블록 ──
const d = book.detail;
if (!d) {
  add("fail", "상세페이지", "detail 없음", "book.json 에 detail 을 넣는다");
} else {
  const types = d.blocks.map((b) => b.type);
  check(types[0] === "hero", "첫 블록", types[0], "hero 로 시작");
  check(new Set(types).size === types.length, "블록 중복", `${types.length - new Set(types).size}개`, "같은 블록은 한 번만");
  check(types.length >= 8 && types.length <= 11, "블록 수", `${types.length}개`, "8~11개");
  const order = RECIPE_ORDER[d.recipe];
  check(Boolean(order), "틀", d.recipe, "A, B, C, D 중 하나");
  if (order) {
    const missing = RECIPE_REQUIRED[d.recipe].filter((t) => !types.includes(t));
    check(missing.length === 0, `틀 ${d.recipe}의 필수 블록`, missing.length ? `빠짐: ${missing.join(", ")}` : "모두 있음", RECIPE_REQUIRED[d.recipe].join(", "));
    let at = -1;
    const outOfOrder = types.find((t) => { const i = order.indexOf(t, at + 1); if (i < 0) return true; at = i; return false; });
    check(!outOfOrder, `틀 ${d.recipe}의 순서`, outOfOrder ? `${outOfOrder} 의 자리가 틀렸거나 이 틀에 없는 블록` : "맞음", order.join(" → "));
  }
  if (book.kind === "deep") check(d.recipe === "D", "심화 가이드의 틀", d.recipe, "심화 가이드는 D");
  else check(d.recipe !== "D", "틀 선택", d.recipe, "D는 심화 가이드 전용");

  // 같은 분야에서 바로 앞에 쓴 책과 틀·hero 모양이 둘 다 같으면 안 된다
  const when = (b) => b.slides.find((s) => s.type === "checklist")?.checkedAt ?? "";
  const prev = sameCat.filter((o) => o.detail && when(o) <= when(book)).sort((a, b) => when(b).localeCompare(when(a)))[0];
  const hero = d.blocks.find((b) => b.type === "hero");
  if (prev) {
    const prevHero = prev.detail.blocks.find((b) => b.type === "hero");
    check(!(prev.detail.recipe === d.recipe && prevHero?.variant === hero?.variant), "직전 책과 다른 구성", `${d.recipe}/${hero?.variant} (직전 ${prev.slug}: ${prev.detail.recipe}/${prevHero?.variant})`, "같은 분야의 직전 책과 틀 또는 hero 모양이 달라야 한다");
  }

  // ── 문구 길이 ──
  for (const b of d.blocks) {
    if (b.title !== undefined) check(b.title.length >= 4 && b.title.length <= 24, `${b.type} 제목`, `${b.title.length}자`, "4~24자");
    if (b.type === "hero") {
      const n = sentences(b.lead).length;
      check(n >= 2 && n <= 3 && b.lead.length <= 160, "hero 소개문", `${n}문장, ${b.lead.length}자`, "2~3문장, 160자 이하 (장면 → 원인 → 주는 것)");
      check(["split", "stack", "band"].includes(b.variant), "hero 모양", b.variant, "split, stack, band 중 하나");
    }
    if (b.type === "for-whom") check(b.items.length >= 3 && b.items.length <= 5 && b.items.every((x) => x.length <= 40), "for-whom 항목", `${b.items.length}개`, "3~5개, 항목당 40자 이하");
    if (b.type === "includes" || b.type === "steps") check(b.items.length >= 2 && b.items.length <= 5 && b.items.every((x) => x.name.length <= 20 && x.desc.length <= 60), `${b.type} 항목`, `${b.items.length}개`, "2~5개, 이름 20자·설명 60자 이하");
    if (b.type === "faq") check(b.items.length >= 3 && b.items.length <= 5 && b.items.every((x) => /\?$/.test(x.q) && x.a.length <= 140), "faq 항목", `${b.items.length}개`, "3~5개, 질문은 ?로 끝나고 답은 140자 이하");
    if (b.type === "problem") check(b.body.length <= 200, "problem 본문", `${b.body.length}자`, "200자 이하");
    if (b.type === "before-after") check(b.before.length <= 80 && b.after.length <= 80, "before-after", `${b.before.length}/${b.after.length}자`, "각 80자 이하");
    if (b.type === "outcome") check(Boolean(b.image?.src) && b.caption.length <= 60, "outcome", b.image?.src ?? "이미지 없음", "결과물 이미지와 60자 이하 설명");
  }

  // ── 문구 속 숫자가 책 데이터와 같은가 ──
  const strings = [];
  const walk = (v, key) => (typeof v === "string" ? (!["type", "variant", "src"].includes(key) && strings.push(v)) : v && typeof v === "object" ? Object.entries(v).forEach(([k, x]) => walk(x, k)) : null);
  walk(d.blocks);
  const copy = strings.join("\n");
  // 심화 가이드는 챕터 파일 안의 입력값 박스(```입력값 N)도 센다. 화면(src/books/content.ts)과 같은 방식이다
  const cdir = join("src", "books", slug, "chapters");
  const chapterFiles = existsSync(cdir) ? readdirSync(cdir).filter((f) => f.endsWith(".md")) : [];
  const chapterInputs = chapterFiles.reduce((n, f) => n + (readFileSync(join(cdir, f), "utf8").match(/^```입력값/gm) ?? []).length, 0);
  const inputs = book.slides.filter((s) => s.type === "step" && s.prompt && /^입력값/.test(s.prompt.label)).length + chapterInputs;
  const wrong = [];
  for (const m of copy.matchAll(/챕터s*(d+)개/g)) if (Number(m[1]) !== chapterFiles.length) wrong.push(`${m[0]} (실제 ${chapterFiles.length}개)`);
  for (const m of copy.matchAll(/슬라이드\s*(\d+)장/g)) if (Number(m[1]) !== book.slides.length) wrong.push(`${m[0]} (실제 ${book.slides.length}장)`);
  for (const m of copy.matchAll(/입력값\s*(\d+)개/g)) if (Number(m[1]) !== inputs) wrong.push(`${m[0]} (실제 ${inputs}개)`);
  check(wrong.length === 0, "문구 속 장 수·챕터 수·입력값 수", wrong.length ? wrong.join(", ") : "책 데이터와 같음", "book.json 과 chapters 폴더의 실제 값과 같아야 한다");
  const minutes = [...copy.matchAll(/(\d+)분/g)].filter((m) => Number(m[1]) !== book.minutes).map((m) => m[0]);
  if (minutes.length) add("warn", "문구 속 시간", `${[...new Set(minutes)].join(", ")} (책의 걸리는 시간은 ${book.minutes}분)`, "걸리는 시간을 말한 것이면 book.json 의 minutes 와 맞춘다");

  // ── 표현 ──
  for (const p of scanPhrases(copy, { banned: [...BANNED, ...SALES_BANNED], weak: [] })) add("fail", "금지 표현", p.found.map((w) => `"${w}"`).join(", "), p.why);
  const ph = copy.match(PLACEHOLDER);
  if (ph) add("fail", "채우지 않은 자리", `"${ph[0]}"`, "확인하지 못한 내용을 남긴 채 넘기지 않는다");
  check(countEmoji(copy) === 0, "이모지", `${countEmoji(copy)}개`, "쓰지 않는다");
}

const mark = { ok: "✓", warn: "△", fail: "✗" };
console.log(`\n상세페이지 검사: ${slug}\n`);
for (const r of results) console.log(`${mark[r.level]} ${r.label}${r.value ? `: ${r.value}` : ""}  — ${r.rule}`);
const fails = results.filter((r) => r.level === "fail").length;
console.log(`\n${fails === 0 ? "합격" : "불합격"}: 불합격 ${fails}개\n`);
process.exit(fails === 0 ? 0 : 1);
