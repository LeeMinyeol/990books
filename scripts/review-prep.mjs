#!/usr/bin/env node
// 검수 준비 도구. content-review 스킬의 2단계에서 쓴다. 이 명령 하나로 자동 검사를 모두 돌린다.
// 하는 일: ① 문체·구조·상세페이지 검사기를 돌려 결과를 모은다 ② 출처 목록 기준 검사
//          ③ 출처 본문과 겹치는 구절 찾기 ④ 확인이 필요한 문장 뽑기
//          ⑤ 검수 보고서(reviews/<이름>-<날짜>.md)를 만들거나, 있으면 1번(자동 검사)만 새로 쓴다
//
// 사용법
//   node scripts/review-prep.mjs --book <slug>
//       본문: src/books/<slug>/book.json (+ chapters/*.md)
//       출처: src/books/<slug>/sources.md,  출처 본문: .research/<slug>/*.txt
//   node scripts/review-prep.mjs --file <글.md> [--type column|deep]
//       출처: <글>.sources.md,  출처 본문: .research/<파일이름>/*.txt
//
// 종료 코드: 자동 검사에 불합격이 있으면 1.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { splitSentences } from "./lib/text.mjs";

const MIN_SOURCES = 3; // 서로 다른 출처(사이트) 수
const MAX_AGE_DAYS = 30; // 출처 확인일이 작성 시점보다 이만큼 넘게 앞서면 다시 확인한다
const OVERLAP_FAIL = 30; // 이 글자 수 이상 똑같으면 불합격
const OVERLAP_WARN = 20; // 이 글자 수 이상이면 주의
const SENTENCE_MIN = 12; // 이 글자 수 이상인 문장이 출처와 통째로 같으면 불합격

const args = process.argv.slice(2);
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
const slug = opt("--book");
const file = opt("--file");
const fileType = opt("--type") ?? "column";
if (!slug && !file) {
  console.error("사용법: node scripts/review-prep.mjs --book <slug> | --file <글.md> [--type column|deep]");
  process.exit(2);
}

const results = [];
const add = (level, label, value, rule) => results.push({ level, label, value, rule });

// ── 대상 읽기 ────────────────────────────────────────────
const name = slug ?? basename(file).replace(/\.md$/, "");
const units = []; // { where, text, isPrompt }
let sourcesPath;
let writtenAt = null;
let bookKind = null;
if (slug) {
  const dir = join("src", "books", slug);
  const book = JSON.parse(readFileSync(join(dir, "book.json"), "utf8"));
  bookKind = book.kind;
  writtenAt = book.slides.find((s) => s.type === "checklist")?.checkedAt ?? null;
  book.slides.forEach((s, i) => {
    const where = `${i + 1}장`;
    for (const key of ["title", "subtitle", "text", "teaser", "totalCost"]) if (s[key]) units.push({ where, text: s[key].replace(/\*\*/g, "") });
    if (s.prompt) units.push({ where: `${where} 입력값`, text: s.prompt.text, isPrompt: true });
    (s.items ?? []).forEach((it) => units.push({ where, text: `${it.label}: ${it.note}` }));
    (s.points ?? []).forEach((p) => units.push({ where, text: p }));
    (s.chips ?? []).forEach((c) => units.push({ where, text: c }));
  });
  const chapters = join(dir, "chapters");
  if (existsSync(chapters)) {
    for (const f of readdirSync(chapters).filter((f) => f.endsWith(".md")).sort()) {
      readFileSync(join(chapters, f), "utf8").split(/\n\s*\n/).forEach((p) => units.push({ where: f, text: p.replace(/[#*_`>]/g, "").trim() }));
    }
  }
  if (book.detail) {
    const walk = (v, key) => (typeof v === "string" ? (!["type", "variant", "src"].includes(key) && units.push({ where: "상세페이지", text: v })) : v && typeof v === "object" ? Object.entries(v).forEach(([k, x]) => walk(x, k)) : null);
    walk(book.detail.blocks);
  }
  sourcesPath = join(dir, "sources.md");
} else {
  readFileSync(file, "utf8").replace(/```[\s\S]*?```/g, "").split(/\n\s*\n/).forEach((p, i) => units.push({ where: `${i + 1}문단`, text: p.replace(/[#*_`>]/g, "").trim() }));
  sourcesPath = file.replace(/\.md$/, ".sources.md");
}
const researchDir = join(".research", name);

// ── ① 다른 검사기 돌리기 ──────────────────────────────────
const outputs = [];
function run(label, script, scriptArgs) {
  let out, ok = true;
  try {
    out = execFileSync(process.execPath, [join("scripts", script), ...scriptArgs], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    ok = false;
    out = `${e.stdout ?? ""}${e.stderr ?? ""}`;
  }
  const fails = (out.match(/^✗/gm) ?? []).length;
  add(ok ? "ok" : "fail", label, ok ? "합격" : `불합격 ${fails}개`, `node scripts/${script} ${scriptArgs.join(" ")}`);
  outputs.push(`$ node scripts/${script} ${scriptArgs.join(" ")}\n${out.trim()}`);
}
if (slug) {
  run("문체 검사", "style-check.mjs", [join("src", "books", slug, "book.json"), "--type", "slide"]);
  const chapters = join("src", "books", slug, "chapters");
  if (existsSync(chapters)) for (const f of readdirSync(chapters).filter((f) => f.endsWith(".md")).sort()) run(`문체 검사 ${f}`, "style-check.mjs", [join(chapters, f), "--type", "deep"]);
  run("구조 검사", "book-check.mjs", [slug]);
  run("상세페이지 검사", "detail-check.mjs", [slug]);
} else {
  run("문체 검사", "style-check.mjs", [file, "--type", fileType]);
}

// ── ② 출처 목록 ──────────────────────────────────────────
if (!existsSync(sourcesPath)) {
  add("fail", "출처 목록", "파일 없음", `${sourcesPath.replace(/\\/g, "/")} 를 만든다`);
} else {
  const rows = readFileSync(sourcesPath, "utf8").split("\n").filter((l) => /^\s*\|/.test(l)).map((l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
  const head = rows[0] ?? [];
  const col = (word) => head.findIndex((h) => h.includes(word));
  const [kindAt, urlAt, dateAt] = [col("종류"), col("주소"), col("확인일")];
  if (kindAt < 0 || urlAt < 0 || dateAt < 0) {
    add("fail", "출처 목록 형식", "열 이름이 다름", "표의 열은 #, 종류, 제목, 주소, 확인일, 무엇을 확인했나");
  } else {
    const data = rows.slice(1).filter((r) => /https?:\/\//.test(r[urlAt] ?? ""));
    const domains = new Set(data.map((r) => r[urlAt].match(/https?:\/\/([^/\s)]+)/)[1].replace(/^www\./, "")));
    const official = data.filter((r) => /^공식/.test(r[kindAt])).length;
    const primary = data.filter((r) => /^(공식|논문)/.test(r[kindAt])).length;
    const dated = data.filter((r) => /^\d{4}-\d{2}-\d{2}$/.test(r[dateAt]));
    add(domains.size >= MIN_SOURCES ? "ok" : "fail", "서로 다른 출처", `${domains.size}곳`, `${MIN_SOURCES}곳 이상 (같은 사이트는 1곳으로 센다)`);
    if (slug && bookKind === "deep") add(primary >= 1 ? "ok" : "fail", "1차 근거", `${primary}개`, '인사이트 책은 종류가 "논문" 또는 "공식 문서"인 출처가 1개 이상');
    else if (slug) add(official >= 1 ? "ok" : "fail", "공식 자료", `${official}개`, '종류가 "공식 문서"인 출처가 1개 이상 (따라 하기 책은 도구를 다룬다)');
    else if (official === 0) add("warn", "공식 자료", "0개", "도구 사용법을 다루는 글이면 그 도구의 공식 문서가 있어야 한다. 검수자가 판단한다");
    add(dated.length === data.length && data.length > 0 ? "ok" : "fail", "확인일", `${dated.length}/${data.length}`, "모든 출처의 확인일 칸에 YYYY-MM-DD");
    if (writtenAt && dated.length) {
      const old = dated.filter((r) => (new Date(writtenAt) - new Date(r[dateAt])) / 86400000 > MAX_AGE_DAYS);
      add(old.length === 0 ? "ok" : "fail", "출처 확인 시점", old.length ? `${old.length}개가 작성 시점(${writtenAt})보다 ${MAX_AGE_DAYS}일 넘게 앞섬` : "작성 시점과 가까움", `확인일이 작성 시점보다 ${MAX_AGE_DAYS}일 넘게 앞서면 다시 확인한다`);
    }
  }
}

// ── ③ 출처 본문과 겹침 ────────────────────────────────────
const norm = (t) => t.replace(/[\s\p{P}\p{S}]/gu, "");
const overlaps = [];
const txts = existsSync(researchDir) ? readdirSync(researchDir).filter((f) => f.endsWith(".txt")) : [];
if (txts.length === 0) {
  add("fail", "겹침 검사", "못 함", `${researchDir.replace(/\\/g, "/")}/ 에 출처 본문(.txt)이 없다. 출처를 읽으며 본문을 저장한 뒤 다시 돌린다`);
} else {
  const sources = txts.map((f) => ({ f, t: norm(readFileSync(join(researchDir, f), "utf8")) }));
  let whole = 0;
  for (const u of units) {
    const mine = norm(u.text);
    for (const src of sources) {
      // 문장이 통째로 같은가 (입력값 박스도 본다)
      for (const s of splitSentences(u.text)) {
        const ns = norm(s);
        if (ns.length >= SENTENCE_MIN && src.t.includes(ns)) { whole++; overlaps.push({ where: u.where, src: src.f, len: ns.length, text: s.slice(0, 40), whole: true }); }
      }
      // 긴 구절이 같은가
      let best = 0, bestAt = 0;
      for (let i = 0; i + OVERLAP_WARN <= mine.length; i++) {
        if (!src.t.includes(mine.slice(i, i + OVERLAP_WARN))) continue;
        let len = OVERLAP_WARN;
        while (i + len < mine.length && src.t.includes(mine.slice(i, i + len + 1))) len++;
        if (len > best) { best = len; bestAt = i; }
        i += len - 1;
      }
      if (best >= OVERLAP_WARN) overlaps.push({ where: u.where, src: src.f, len: best, text: mine.slice(bestAt, bestAt + 40) });
    }
  }
  const worst = Math.max(0, ...overlaps.map((o) => o.len));
  add(whole === 0 ? "ok" : "fail", "출처와 통째로 같은 문장", `${whole}개`, `${SENTENCE_MIN}자 이상인 문장이 출처와 똑같으면 불합격 (입력값 박스 포함, 출처 ${sources.length}개와 비교)`);
  add(worst >= OVERLAP_FAIL ? "fail" : worst >= OVERLAP_WARN ? "warn" : "ok", "출처와 같은 긴 구절", worst ? `가장 긴 것 ${worst}자` : "없음", `${OVERLAP_FAIL}자 이상 같으면 불합격, ${OVERLAP_WARN}자 이상은 고쳐 쓴다`);
}

// ── ④ 확인이 필요한 문장 ──────────────────────────────────
const CUE = /\d|에 따르면|기준|공식|무료|유료|요금|플랜|버전|지원(해|합|돼|됩)|제공(해|합|돼|됩)|출시|최대|최소|이상|이하|까지만|제한|반드시|항상|자동으로|버튼|메뉴|탭|아이콘|눌러|클릭|설정|화면|왼쪽|오른쪽|위쪽|아래쪽|상단|하단/;
const claims = [];
for (const u of units) {
  if (u.isPrompt) continue; // 입력값 박스는 독자가 넣는 글이라 사실 주장이 아니다
  for (const s of splitSentences(u.text)) if (s.length > 5 && CUE.test(s)) claims.push({ where: u.where, text: s });
}

// ── ⑤ 보고서 ─────────────────────────────────────────────
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`; // 현지 날짜
const mark = { ok: "✓", warn: "△", fail: "✗" };
const lines = results.map((r) => `${mark[r.level]} ${r.label}: ${r.value} — ${r.rule}`);
const section1 = `## 1. 자동 검사 (review-prep이 돌릴 때마다 새로 쓴다)
마지막 실행: ${today} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}

${lines.map((l) => `- ${l}`).join("\n")}
${overlaps.length ? `\n겹친 곳:\n${overlaps.slice(0, 20).map((o) => `- ${o.where} ↔ ${o.src} (${o.len}자${o.whole ? ", 문장 통째" : ""}): "${o.text}"`).join("\n")}\n` : ""}
<details><summary>검사기 출력 전문</summary>

\`\`\`
${outputs.join("\n\n")}
\`\`\`

</details>

`;
const reportPath = join("reviews", `${name}-${today}.md`);
if (existsSync(reportPath)) {
  const old = readFileSync(reportPath, "utf8");
  writeFileSync(reportPath, old.replace(/## 1\. 자동 검사[\s\S]*?(?=## 2\. )/, section1), "utf8");
} else {
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `# 검수 보고서: ${name}

- 검수일: ${today}
- 대상: ${slug ? `src/books/${slug}/book.json` : file.replace(/\\/g, "/")}
- 검수한 모델: (모델 이름을 적는다)
- **판정: (합격 / 불합격 중 하나만 남긴다)**
- 고친 문장 수: (0이어도 적는다) / 삭제한 문장 수: (0이어도 적는다)

${section1}## 2. 본문 통독
독자처럼 첫 장부터 끝까지 읽고, 항목마다 **맞음 / 어긋남** 중 하나와 근거가 되는 장 번호를 적는다. 앞에서 불합격이 정해졌어도 끝까지 한다.

| 볼 것 | 맞음 / 어긋남 | 근거 (장 번호, 문장) |
|---|---|---|
| 제목·부제·칩이 약속한 것(결과물, 시간, "한 번에" 같은 말)이 본문에서 실제로 이뤄지는가 |  |  |
| 숫자가 서로 같은가 (장 수, 입력값 수, 걸리는 시간, 개수) |  |  |
| 입력값의 [ ] 자리마다 무엇을 넣을지 본문이나 예시가 알려주는가 |  |  |
| 앞 장의 결과를 가리키는 말("위 3가지", "2단계의 질문")이 실제 그 장과 맞는가 |  |  |
| 단계마다 잘됐는지 확인하는 방법이나 막혔을 때 할 일이 있는가 |  |  |
| 요약의 항목이 본문에서 실제로 만든 것인가 |  |  |
| 다음편 소개가 이 책의 독자·결과물과 이어지는가 |  |  |
| 상세페이지 문구가 본문과 어긋나지 않는가 |  |  |

## 3. 사실 확인
판정 칸에는 **확인 / 고침 / 삭제** 중 하나만 쓴다. "확인"에는 출처 번호(sources.md의 #)를 적는다. 장 수나 입력값 수처럼 책 자체에서 세어 확인하는 것은 출처 칸에 "책 데이터"라고 적는다. 표에 없는 도구 이름·메뉴 이름·버튼 이름·수치가 본문에 있으면 줄을 추가한다.

| # | 위치 | 문장 | 판정 | 출처 # | 메모 |
|---|---|---|---|---|---|
${claims.map((c, i) => `| ${i + 1} | ${c.where} | ${c.text.replace(/\|/g, "/")} |  |  |  |`).join("\n")}

## 4. 정책 점검
- [ ] 수익·매출·조회수·성공을 약속하는 문장이 없다
- [ ] 지어낸 경력, 수치, 사례, 후기가 없다 (3번 표에서 "확인"이 아닌 수치는 모두 지웠다)
- [ ] "직접 해 봤어요/안 해 봤어요" 류의 문장이 없다
- [ ] 투자 종목, 매수·매도 시점, 수익 전망이 없다
- [ ] 의학적 효과 주장이 없다
- [ ] 긴급성 장치(마감 임박, 남은 수량, 오늘만)와 부풀린 정가가 없다
- [ ] 작성 시점, 도구 이름, 버전(또는 요금제)이 준비물 장에 있다
- [ ] 이미지 파일을 열어 봤고, 타사 로고·캐릭터·캡처 속 개인정보가 없다

## 5. 구성 비교 (표절 점검)
출처마다 목차(소제목 순서)를 적고, 우리 목차와 같은 순서로 이어지는 항목 수를 센다. 우리 항목 수의 절반 이상이면 불합격이다.

| 출처 # | 출처의 목차 | 순서가 같은 항목 수 / 우리 항목 수 | 판정 |
|---|---|---|---|
|  |  |  |  |

출처의 예시·비유·프롬프트 문구·가상의 가게 이름을 그대로 쓴 곳: (없으면 "없음")

## 6. 남은 일
- 돈 낼 이유 넷(파일, 완주 설계, 막히는 지점, 정리) 중 갖춘 것과 근거가 되는 장 번호:
- 고쳐야 할 것:
`, "utf8");
}

console.log(`\n검수 준비: ${name}\n`);
lines.forEach((l) => console.log(l));
console.log(`\n확인이 필요한 문장 ${claims.length}개 → ${reportPath.replace(/\\/g, "/")} 의 3번 표`);
const fails = results.filter((r) => r.level === "fail").length;
console.log(`${fails === 0 ? "자동 검사 통과" : `자동 검사 불합격 ${fails}개`}\n`);
process.exit(fails === 0 ? 0 : 1);
