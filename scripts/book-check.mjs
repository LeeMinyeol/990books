#!/usr/bin/env node
// 전자책 구조 검사기. 규칙의 설명은 .claude/skills/ebook-production/SKILL.md 에 있다.
// 문장 길이·말투는 style-check.mjs 가 본다. 여기서는 구성과 필수 표기를 본다.
//
// 사용법: node scripts/book-check.mjs <slug>
// 불합격(✗)이 하나라도 있으면 종료 코드 1.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { PLACEHOLDER } from "./lib/text.mjs";

const slug = process.argv[2];
if (!slug) {
  console.error("사용법: node scripts/book-check.mjs <slug>");
  process.exit(2);
}

const dir = join("src", "books", slug);
const load = (s) => JSON.parse(readFileSync(join("src", "books", s, "book.json"), "utf8"));
const book = load(slug);
const others = readdirSync(join("src", "books"), { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== slug && existsSync(join("src", "books", d.name, "book.json")))
  .map((d) => load(d.name));
const palette = JSON.parse(readFileSync("src/lib/palette.json", "utf8")).colors;
const prices = [...readFileSync("src/lib/pricing.ts", "utf8").matchAll(/price:\s*(\d+)/g)].map((m) => `${Number(m[1]).toLocaleString("ko-KR")}원`);

// 2026-11-15: mini는 따라 하기(슬라이드형 또는 긴 글형), deep은 인사이트 책이다
const HAS_CHAPTERS = existsSync(join("src", "books", slug, "chapters"));
const SIZE = {
  mini: HAS_CHAPTERS
    ? { chapters: [3, 7], chars: [8000, 25000], inputs: 3, format: "howto" }
    : { slides: [10, 15], inputs: 3, minutes: 30 },
  kit: { slides: [25, 40], inputs: 8, minutes: 60 },
  deep: { chapters: [5, 7], chars: [15000, 25000], format: "insight" },
};
const IMAGE_MAX = 200 * 1024;
const RATIO = 16 / 10;

const results = [];
const add = (level, label, value, rule) => results.push({ level, label, value, rule });
const check = (ok, label, value, rule) => add(ok ? "ok" : "fail", label, String(value ?? ""), rule);

// ── 기본 정보 ──
for (const key of ["slug", "kind", "accent", "onAccent", "title", "category", "topic", "tools", "extraCost", "minutes"]) {
  if (book[key] === undefined || book[key] === "") add("fail", "기본 정보", `${key} 없음`, "book.json 맨 위 항목을 모두 채운다");
}
check(book.slug === slug, "slug", book.slug, "폴더 이름과 같아야 한다");
check(Boolean(SIZE[book.kind]), "종류", book.kind, "mini, kit, deep 중 하나");
check(book.title.length >= 12 && book.title.length <= 32, "제목 길이", `${book.title.length}자`, "12~32자 (도구 + 결과물 + 시간)");

const color = palette.find((c) => c.accent.toLowerCase() === String(book.accent).toLowerCase());
check(Boolean(color), "포인트컬러", book.accent, "src/lib/palette.json 의 색 중 하나");
if (color) check(String(book.onAccent).toLowerCase() === color.onAccent.toLowerCase(), "색 위 글자색", book.onAccent, `${color.name} 색은 ${color.onAccent}`);
const sameCat = others.filter((o) => o.category === book.category);
if (sameCat.length < palette.length) {
  const clash = sameCat.find((o) => String(o.accent).toLowerCase() === String(book.accent).toLowerCase());
  check(!clash, "같은 분야 색 겹침", clash ? `${clash.slug}와 같은 색` : "없음", "같은 분야의 책끼리 색이 겹치지 않는다");
}

// 채우지 않은 자리가 남아 있으면 공개할 수 없다
const leftover = JSON.stringify(book).match(new RegExp(PLACEHOLDER.source, "g"));
check(!leftover, "채우지 않은 자리", leftover ? `"${leftover[0]}" 등 ${leftover.length}곳` : "없음", '"확인 필요", "미정" 같은 표시를 남긴 채 넘기지 않는다');

// ── 장 순서 ──
const s = book.slides;
const types = s.map((x) => x.type);
check(types[0] === "cover", "1장", types[0], "표지");
check(types[1] === "checklist", "2장", types[1], "준비물 체크");
check(types.at(-2) === "summary", "끝에서 2번째 장", types.at(-2), "요약");
check(types.at(-1) === "next", "마지막 장", types.at(-1), "다음편 예고");
const steps = s.filter((x) => x.type === "step");
check(types.slice(2, -2).every((t) => t === "step"), "본문", `${steps.length}장`, "표지·준비물과 요약·다음편 사이는 모두 따라 하기 장");
check(steps.every((x, i) => x.step === i + 1), "단계 번호", steps.map((x) => x.step).join(","), "1부터 차례대로");

const cover = s[0];
if (cover?.type === "cover") {
  check(cover.title === book.title, "표지 제목", "", "book.title 과 같아야 한다");
  // 인사이트 책은 결과물이 없으니 결과물 그림 대신 그림 표지(jacket.image)를 본다
  if (book.kind === "deep") check(Boolean(book.jacket?.image), "그림 표지", book.jacket?.image ?? "없음", "인사이트 책은 jacket.image(그림 표지)를 넣는다");
  else check(Boolean(cover.preview?.src), "표지 미리보기", cover.preview?.src ?? "없음", "완성 결과물 이미지를 넣는다");
  check(cover.chips?.length >= 2 && cover.chips.length <= 4, "표지 칩", `${cover.chips?.length ?? 0}개`, "2~4개 (걸리는 시간, 분량, 필요한 도구)");
}
const checklist = s[1];
if (checklist?.type === "checklist") {
  check(/^\d{4}-\d{2}-\d{2}$/.test(checklist.checkedAt ?? ""), "작성 시점", checklist.checkedAt ?? "없음", "YYYY-MM-DD");
  check(checklist.items.length >= 2 && checklist.items.length <= 5, "준비물 수", `${checklist.items.length}개`, "2~5개");
  const versioned = checklist.items.some((it) => /(버전|요금제|플랜|v\d|\d{4}년)/.test(`${it.label} ${it.note}`) && !PLACEHOLDER.test(`${it.label} ${it.note}`));
  check(versioned, "도구 버전 표기", "", "준비물 중 도구 하나 이상에 확인한 버전이나 요금제, 화면 기준 시점을 적는다");
  check(Boolean(checklist.totalCost), "예상 비용", checklist.totalCost ?? "없음", "금액으로 적는다");
}
const summary = s.at(-2);
if (summary?.type === "summary") check(summary.points.length >= 3 && summary.points.length <= 5, "요약 항목", `${summary.points.length}개`, "3~5개");
const next = s.at(-1);
if (next?.type === "next") check(prices.includes(next.price), "다음편 가격", next.price, `src/lib/pricing.ts 의 값 중 하나 (${prices.join(", ")})`);

// ── 입력값 ──
// 복사해 쓰는 것은 "입력값 N", 참고로 보여주는 것은 "작성 예시". 개수에는 "입력값 N"만 센다
const boxes = steps.filter((x) => x.prompt);
const badLabel = boxes.find((x) => !/^(입력값 \d+|작성 예시)$/.test(x.prompt.label));
check(!badLabel, "입력값 박스 이름", badLabel ? `"${badLabel.prompt.label}"` : "", '"입력값 1"처럼 번호를 붙이거나 "작성 예시"');
const inputs = boxes.filter((x) => /^입력값/.test(x.prompt.label));
check(inputs.every((x, i) => x.prompt.label === `입력값 ${i + 1}`), "입력값 번호", inputs.map((x) => x.prompt.label.replace("입력값 ", "")).join(","), "1부터 차례대로");

// ── 분량 ──
const rule = SIZE[book.kind];
if (rule?.slides) {
  check(s.length >= rule.slides[0] && s.length <= rule.slides[1], "슬라이드 수", `${s.length}장`, `${rule.slides[0]}~${rule.slides[1]}장`);
  check(inputs.length >= rule.inputs, "복사해 쓰는 입력값", `${inputs.length}개`, `${rule.inputs}개 이상 ("작성 예시"는 세지 않는다)`);
  check(book.minutes <= rule.minutes, "따라 하는 시간", `${book.minutes}분`, `${rule.minutes}분 이하`);
  let bare = 0, worst = 0;
  for (const x of steps) { bare = x.prompt || x.image ? 0 : bare + 1; worst = Math.max(worst, bare); }
  check(worst <= 2, "글만 있는 장 연속", `${worst}장`, "입력값도 이미지도 없는 장은 연속 2장까지");
}
if (rule?.chapters) {
  const cdir = join(dir, "chapters");
  const files = existsSync(cdir) ? readdirSync(cdir).filter((f) => f.endsWith(".md")).sort() : [];
  check(files.length >= rule.chapters[0] && files.length <= rule.chapters[1], "챕터 수", `${files.length}개`, `${rule.chapters[0]}~${rule.chapters[1]}개 (src/books/${slug}/chapters/NN-이름.md)`);
  const chars = files.reduce((n, f) => n + readFileSync(join(cdir, f), "utf8").replace(/\s/g, "").length, 0);
  check(chars >= rule.chars[0] && chars <= rule.chars[1], "전체 글자 수(공백 제외)", chars.toLocaleString(), `${rule.chars[0].toLocaleString()}~${rule.chars[1].toLocaleString()}자`);
  // 따라 하기 장은 고정 6구역, 인사이트 장은 끝의 두 절(적용, 한 줄 요약)을 꼭 둔다
  const NEED = rule.format === "insight"
    ? ["내 일에 대입해 보기", "이 장의 한 줄"]
    : ["이 장을 마치면", "먼저 알아둘 것", "따라 하기", "자주 막히는 곳", "나쁜 예와 좋은 예", "점검표"];
  if (rule.inputs) {
    const chapterBoxes = files.reduce((n, f) => n + (readFileSync(join(cdir, f), "utf8").match(/^```입력값 \d+/gm) || []).length, 0);
    check(chapterBoxes >= rule.inputs, "복사해 쓰는 입력값", `${chapterBoxes}개`, `${rule.inputs}개 이상 (챕터 안의 "입력값 N" 박스)`);
  }
  for (const f of files) {
    const text = readFileSync(join(cdir, f), "utf8");
    const missing = NEED.filter((h) => !new RegExp(`^##\\s+${h}`, "m").test(text));
    check(missing.length === 0, `${f} 구조`, missing.length ? `빠짐: ${missing.join(", ")}` : "", NEED.join(" → "));
  }
}

// ── 이미지 ──
function ratioOf(path) {
  if (path.endsWith(".svg")) {
    const m = readFileSync(path, "utf8").match(/viewBox="[\d.\s-]*?([\d.]+)\s+([\d.]+)"/);
    return m ? Number(m[1]) / Number(m[2]) : null;
  }
  if (path.endsWith(".png")) {
    const b = readFileSync(path);
    return b.readUInt32BE(16) / b.readUInt32BE(20);
  }
  return null; // webp, jpg 는 여기서 재지 못한다
}
const images = [cover?.preview, book.cover, ...steps.map((x) => x.image)].filter((im) => im?.src);
let imageFails = 0;
for (const im of images) {
  const p = join("public", im.src);
  const bad = (label, value, why) => { imageFails++; add("fail", label, value, why); };
  if (!existsSync(p)) { bad("이미지", im.src, "파일이 없다"); continue; }
  if (statSync(p).size > IMAGE_MAX) bad("이미지 용량", `${im.src} ${Math.round(statSync(p).size / 1024)}KB`, "200KB 이하");
  const r = ratioOf(p);
  if (r === null) add("warn", "이미지 비율", im.src, "16:10인지 직접 확인한다 (svg, png만 자동으로 잰다)");
  else if (Math.abs(r - RATIO) > 0.02) bad("이미지 비율", `${im.src} ${r.toFixed(2)}:1`, "16:10 (1.60:1)");
  if (!im.alt || im.alt.length < 6) bad("이미지 설명", im.src, "alt 에 화면 내용을 6자 이상으로 적는다");
}
if (imageFails === 0) add("ok", "이미지", `${images.length}장`, "파일 있음, 200KB 이하, 16:10, 설명 있음");

check(existsSync(join(dir, "sources.md")), "출처 목록", existsSync(join(dir, "sources.md")) ? "있음" : "없음", `src/books/${slug}/sources.md`);

const mark = { ok: "✓", warn: "△", fail: "✗" };
console.log(`\n전자책 구조 검사: ${slug} (${book.kind})\n`);
for (const r of results) console.log(`${mark[r.level]} ${r.label}${r.value ? `: ${r.value}` : ""}  — ${r.rule}`);
const fails = results.filter((r) => r.level === "fail").length;
console.log(`\n${fails === 0 ? "합격" : "불합격"}: 불합격 ${fails}개\n`);
process.exit(fails === 0 ? 0 : 1);
