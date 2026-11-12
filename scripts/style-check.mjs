#!/usr/bin/env node
// 문체 검사기. 규칙의 근거와 설명은 docs/writing-style.md에 있다.
//
// 사용법
//   node scripts/style-check.mjs <파일> --type column   오늘의 칼럼 (.md, .txt)
//   node scripts/style-check.mjs <파일> --type deep     전자책 긴 글형 챕터 (.md, .txt)
//   node scripts/style-check.mjs <book.json> --type slide   전자책 슬라이드형
//
// 불합격(✗)이 하나라도 있으면 종료 코드 1로 끝난다. 주의(△)는 사람이 판단한다.

import { readFileSync } from "node:fs";
import { PLACEHOLDER, countEmoji, ending, scanPhrases, splitSentences } from "./lib/text.mjs";

// 소제목은 ## 만 센다. 긴 글형의 단계 제목(###)은 세지 않는다
const LIMITS = {
  column: { avgMax: 45, longMax: 15, paraMax: 10, charsMin: 1000, charsMax: 3000, headMin: 3, headMax: 7, emojiMax: 2 },
  deep: { avgMax: 45, longMax: 12, paraMax: 10, charsMin: 2000, charsMax: 4500, headMin: 5, headMax: 8, emojiMax: 0 },
};
const HAEYO_MIN = 75; // 평서문 중 해요체
const HAMNIDA_MAX = 20; // 평서문 중 "~습니다"
const HANDA_MAX = 5; // 평서문 중 "~한다"
const SLIDE = { titleMax: 22, sentenceMax: 40, sentencesMax: 2 };
const LONG = 60; // 이 글자 수를 넘으면 긴 문장으로 센다

function parseMarkdown(raw) {
  const text = raw.replace(/^---[\s\S]*?---\n/, "").replace(/```[\s\S]*?```/g, "");
  const heads = [];
  const paras = [];
  const clean = (s) => s.replace(/[*_`>#]/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  for (const block of text.split(/\n\s*\n/)) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const body = [];
    for (const line of lines) {
      if (/^#\s/.test(line)) continue; // 글 제목(H1)
      if (/^##\s/.test(line)) heads.push(line.replace(/^#+\s*/, ""));
      else if (/^#{3,6}\s/.test(line)) continue; // 단계 제목은 본문 문장으로도, 소제목으로도 세지 않는다
      else if (/^(\||!\[|<)/.test(line)) continue; // 표, 이미지, HTML
      else if (/^([-*+]|\d+\.)\s+/.test(line)) paras.push(clean(line.replace(/^([-*+]|\d+\.)\s+/, ""))); // 목록은 항목 하나가 문단 하나
      else body.push(clean(line));
    }
    if (body.length) paras.push(body.join(" "));
  }
  return { heads, paras };
}

const results = [];
const add = (level, name, value, rule) => results.push({ level, name, value, rule });
const check = (ok, name, value, rule) => add(ok ? "ok" : "fail", name, value, rule);

function addPhrases(text) {
  for (const p of scanPhrases(text)) {
    add(p.level, p.level === "fail" ? "금지 표현" : "상투 표현", `${p.found.map((w) => `"${w}"`).join(", ")}${p.count > 1 ? ` (모두 ${p.count}회)` : ""}`, p.why);
  }
  const ph = text.replace(/"[^"\n]*"|“[^”\n]*”/g, "").match(PLACEHOLDER);
  if (ph) add("fail", "채우지 않은 자리", `"${ph[0]}"`, "확인하지 못한 내용을 남긴 채 공개하지 않는다");
}

function checkProse(raw, type) {
  const L = LIMITS[type];
  const { heads, paras } = parseMarkdown(raw);
  const text = paras.join("\n");
  const sents = splitSentences(text);
  if (sents.length === 0) throw new Error("본문 문장을 찾지 못했어요.");
  const lens = sents.map((s) => s.length);
  const avg = Math.round(lens.reduce((a, b) => a + b, 0) / lens.length);
  const longPct = Math.round((100 * lens.filter((n) => n > LONG).length) / lens.length);
  const counts = { haeyo: 0, hamnida: 0, handa: 0, question: 0, etc: 0 };
  sents.forEach((s) => counts[ending(s)]++);
  const stated = counts.haeyo + counts.hamnida + counts.handa; // 평서문만 놓고 말투 비율을 본다
  const pct = (n) => (stated ? Math.round((100 * n) / stated) : 0);
  const bigPct = Math.round((100 * paras.filter((p) => splitSentences(p).length > 3).length) / paras.length);
  const chars = text.replace(/\s/g, "").length;
  const emoji = countEmoji(raw);

  check(avg <= L.avgMax, "평균 문장 길이", `${avg}자`, `${L.avgMax}자 이하 (목표 25~42자)`);
  if (avg < 25) add("warn", "문장이 너무 짧음", `${avg}자`, "25자 미만이면 뚝뚝 끊겨 읽힌다. 이유와 결과를 한 문장에 묶는다");
  check(longPct <= L.longMax, `${LONG}자 넘는 문장`, `${longPct}%`, `${L.longMax}% 이하`);
  check(bigPct <= L.paraMax, "4문장 이상 문단", `${bigPct}%`, `${L.paraMax}% 이하 (문단은 1~3문장)`);
  if (stated < 5) {
    add("warn", "말투", `평서문 ${stated}개`, "평서문이 거의 없어 말투를 재지 못했다. 목록만 있는 글이면 설명 문장을 넣는다");
  } else {
    check(pct(counts.haeyo) >= HAEYO_MIN, "해요체 비율", `${pct(counts.haeyo)}%`, `평서문의 ${HAEYO_MIN}% 이상`);
    check(pct(counts.hamnida) <= HAMNIDA_MAX, '"~습니다" 비율', `${pct(counts.hamnida)}%`, `${HAMNIDA_MAX}% 이하 (사실을 못 박는 문장에만)`);
    check(pct(counts.handa) <= HANDA_MAX, "한다체 비율", `${pct(counts.handa)}%`, `${HANDA_MAX}% 이하 (인용문 말고는 쓰지 않는다)`);
  }
  check(chars >= L.charsMin && chars <= L.charsMax, "분량(공백 제외)", `${chars.toLocaleString()}자`, `${L.charsMin.toLocaleString()}~${L.charsMax.toLocaleString()}자`);
  check(heads.length >= L.headMin && heads.length <= L.headMax, "소제목(##) 수", `${heads.length}개`, `${L.headMin}~${L.headMax}개`);
  check(emoji <= L.emojiMax, "이모지", `${emoji}개`, `${L.emojiMax}개 이하`);
  const longHeads = heads.filter((h) => h.length > 28);
  if (longHeads.length) add("warn", "긴 소제목", `"${longHeads[0].slice(0, 20)}…" 등 ${longHeads.length}개`, "소제목은 28자 이하");
  addPhrases(raw);
}

function checkSlides(raw) {
  const book = JSON.parse(raw);
  const all = [];
  let lengthFails = 0;
  const fail = (name, value, rule) => { lengthFails++; add("fail", name, value, rule); };
  book.slides.forEach((slide, i) => {
    const n = i + 1;
    if (slide.title && slide.type !== "cover" && slide.type !== "next" && slide.title.length > SLIDE.titleMax) {
      fail(`${n}장 제목`, `${slide.title.length}자`, `${SLIDE.titleMax}자 이하`);
    }
    if (slide.type === "step") {
      const plain = slide.text.replace(/\*\*/g, "");
      const sents = splitSentences(plain);
      if (sents.length > SLIDE.sentencesMax) fail(`${n}장 본문`, `${sents.length}문장`, `${SLIDE.sentencesMax}문장 이하 (한 장 한 동작)`);
      const tooLong = sents.find((s) => s.length > SLIDE.sentenceMax);
      if (tooLong) fail(`${n}장 본문`, `${tooLong.length}자 문장`, `문장당 ${SLIDE.sentenceMax}자 이하 (목표 30자)`);
      const bold = (slide.text.match(/\*\*[^*]+\*\*/g) || []).length;
      if (bold > 1) fail(`${n}장 강조`, `굵게 ${bold}곳`, "한 장에 굵게 1곳");
      if (!["haeyo", "question"].includes(ending(plain))) add("warn", `${n}장 말투`, `"${plain.slice(-12)}"`, "해요체로 끝낸다");
      all.push(plain);
    }
    for (const key of ["subtitle", "teaser", "title"]) if (slide[key]) all.push(slide[key]);
    if (slide.points) all.push(...slide.points);
    if (slide.items) slide.items.forEach((it) => all.push(it.label, it.note));
  });
  if (lengthFails === 0) add("ok", "슬라이드 길이", `${book.slides.length}장 모두`, "제목·문장 길이 기준 통과");
  check(countEmoji(JSON.stringify(book.slides)) === 0, "이모지", `${countEmoji(JSON.stringify(book.slides))}개`, "전자책에는 쓰지 않는다");
  addPhrases(all.join("\n"));
}

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--") && a !== args[args.indexOf("--type") + 1]);
const type = args.includes("--type") ? args[args.indexOf("--type") + 1] : null;
if (!file || !["column", "deep", "slide"].includes(type)) {
  console.error("사용법: node scripts/style-check.mjs <파일> --type column|deep|slide");
  process.exit(2);
}

const raw = readFileSync(file, "utf8");
if (type === "slide") checkSlides(raw);
else checkProse(raw, type);

const mark = { ok: "✓", warn: "△", fail: "✗" };
console.log(`\n문체 검사: ${file} (${type})\n`);
for (const r of results) console.log(`${mark[r.level]} ${r.name}: ${r.value}  — ${r.rule}`);
const fails = results.filter((r) => r.level === "fail").length;
const warns = results.filter((r) => r.level === "warn").length;
console.log(`\n${fails === 0 ? "합격" : "불합격"}: 불합격 ${fails}개, 주의 ${warns}개\n`);
process.exit(fails === 0 ? 0 : 1);
