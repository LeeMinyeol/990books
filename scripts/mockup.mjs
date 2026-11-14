#!/usr/bin/env node
// 책 그림(설명용 목업) 생성기. 규칙은 docs/image-style.md.
//
// 사용법: node scripts/mockup.mjs <slug>
//   src/books/<slug>/figures/*.json 을 읽어 public/books/<slug>/<이름>.svg 를 만든다.
//   포인트컬러는 src/books/<slug>/book.json 의 accent, onAccent 를 쓴다.
//
// 그림 설명(JSON) 형식
// {
//   "alt": "그림이 보여주는 동작 한 문장 (원고의 ![alt]와 같게)",
//   "layout": "right" | "below",          설명 목록 위치. 기본 right
//   "items": [ 화면 조각 요소들 ],        좌표는 자유롭게 잡는다. 묶음 전체를 캔버스 가운데로 옮긴다
//   "notes": [ { "n": 1, "text": "Code 탭" } ]   설명 목록. n은 items의 mark 번호와 같게
// }
//
// 요소 (x, y는 왼쪽 위. 글자 크기를 적지 않으면 규칙의 기본값을 쓴다)
//   { "type": "card", "x", "y", "w", "h" }                         흰 바탕 화면 조각
//   { "type": "text", "x", "y", "text", "bold"?, "tone"?: "sub", "mark"? }   y는 글줄 가운데
//   { "type": "bar", "x", "y", "w" }                               읽을 필요 없는 글(회색 막대). y는 가운데
//   { "type": "icon", "x", "y", "name", "boxed"?, "mark"? }        아이콘(44px). 이름은 ICONS 참고
//   { "type": "chip", "x", "y", "text", "icon"?, "chevron"?, "mark"? }  아이콘+글자+⌄ 한 덩어리
//   { "type": "input", "x", "y", "w", "h", "text", "mark"? }       입력 상자(왼쪽 +, 오른쪽 마이크)
//   { "type": "menu", "x", "y", "w", "rows": [ {"text", "chevron"?, "shortcut"?, "bold"?, "tone"?: "sub"|"faint", "selected"?, "mark"?, "badge"?: "right"|"left"|"corner"} | {"bar": 폭} | {"sep": true} ] }
//   { "type": "line", "x", "y", "w"?, "h"? }                       구분선(가로 또는 세로)
//   { "type": "box", "x", "y", "w", "h", "mark" }                  보이지 않는 영역(여러 줄을 한 번에 강조)
// mark: 번호(1~3). 그 요소를 포인트컬러 테두리로 감싸고 번호표를 붙인다.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const W = 1280;
const H = 800;
const MARGIN = 72;
const GAP = 64;
const UI = 40; // 화면 속 글자
const NOTE = 36; // 설명 목록 글자
const MIN_TEXT = 36;
const C = { bg: "#F4F3F1", card: "#FFFFFF", line: "#E7E5E2", ink: "#141414", sub: "#5E5B57", bar: "#E7E5E2", faint: "#9A968F", soft: "#EDEBE8" };
const FONT = "Pretendard, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";

// 24칸 격자 위 아이콘 (선 두께 2)
const ICONS = {
  menu: "M4 6h16M4 12h16M4 18h11",
  panel: "M4 5h16v14H4zM9 5v14",
  back: "M15 5l-7 7 7 7",
  forward: "M9 5l7 7-7 7",
  chat: "M4 5h16v11H10l-5 4v-4H4z",
  code: "M9 7l-5 5 5 5M15 7l5 5-5 5",
  plus: "M12 5v14M5 12h14",
  mic: "M9 5a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0zM6 11a6 6 0 0 0 12 0M12 17v3",
  folder: "M3 7h7l2 2h9v10H3z",
  computer: "M5 6h14v9H5zM3 18h18",
  search: "M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM15.5 15.5L20 20",
  clock: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 7v5l3 2",
  cloud: "M7 18h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1A3.5 3.5 0 0 0 7 18z",
  chevDown: "M6 9l6 6 6-6",
  chevRight: "M9 6l6 6-6 6",
  check: "M5 12l5 5 9-10",
  ring: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 7a5 5 0 0 1 5 5",
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** 글자 폭 어림. 서체마다 다르므로 조금 넉넉하게 잡는다 */
function textWidth(text, size, bold = false) {
  let w = 0;
  for (const ch of String(text)) {
    const c = ch.codePointAt(0);
    if (c >= 0xac00 && c <= 0xd7a3) w += bold ? 1.0 : 0.96;
    else if (ch === " ") w += 0.3;
    else if (/[0-9]/.test(ch)) w += 0.6;
    else if (/[A-Z]/.test(ch)) w += 0.66;
    else if (/[a-z]/.test(ch)) w += 0.56;
    else if (ch === "…" || ch === "→" || ch === "⌄") w += 1.0;
    else w += 0.42;
  }
  return w * size;
}

function icon(name, x, y, size = 44, color = C.sub) {
  const d = ICONS[name];
  if (!d) throw new Error(`없는 아이콘: ${name} (가능: ${Object.keys(ICONS).join(", ")})`);
  const s = size / 24;
  // 크기와 관계없이 선 두께가 화면에서 3px로 보이게 한다
  return `<path d="${d}" transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${color}" stroke-width="${(3 / s).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** 요소 하나를 그리고, 차지하는 상자와 강조할 상자를 돌려준다 */
function draw(el) {
  const out = [];
  let box;
  let markBox;
  switch (el.type) {
    case "box": {
      // 보이지 않는 영역. 여러 줄을 한 번에 강조할 때 mark와 함께 쓴다
      box = [el.x, el.y, el.w, el.h];
      break;
    }
    case "card": {
      out.push(`<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" rx="16" fill="${C.card}" stroke="${C.line}" stroke-width="2"/>`);
      box = [el.x, el.y, el.w, el.h];
      break;
    }
    case "text": {
      const size = el.size ?? UI;
      if (size < MIN_TEXT) throw new Error(`글자가 너무 작아요: "${el.text}" ${size}px (최소 ${MIN_TEXT}px)`);
      const color = el.tone === "sub" ? C.sub : C.ink;
      out.push(`<text x="${el.x}" y="${el.y}" font-size="${size}" font-weight="${el.bold ? 700 : 400}" fill="${color}" dominant-baseline="central">${esc(el.text)}</text>`);
      const w = textWidth(el.text, size, el.bold);
      box = [el.x, el.y - size * 0.62, w, size * 1.24];
      break;
    }
    case "bar": {
      out.push(`<rect x="${el.x}" y="${el.y - 11}" width="${el.w}" height="22" rx="11" fill="${C.bar}"/>`);
      box = [el.x, el.y - 11, el.w, 22];
      break;
    }
    case "line": {
      const w = el.w ?? 0;
      const h = el.h ?? 0;
      out.push(`<line x1="${el.x}" y1="${el.y}" x2="${el.x + w}" y2="${el.y + h}" stroke="${C.line}" stroke-width="2"/>`);
      box = [el.x, el.y, Math.max(w, 2), Math.max(h, 2)];
      break;
    }
    case "icon": {
      const size = 44;
      if (el.boxed) out.push(`<rect x="${el.x - 12}" y="${el.y - 12}" width="${size + 24}" height="${size + 24}" rx="14" fill="${C.soft}"/>`);
      out.push(icon(el.name, el.x, el.y, size, el.boxed ? C.ink : C.sub));
      box = el.boxed ? [el.x - 12, el.y - 12, size + 24, size + 24] : [el.x, el.y, size, size];
      break;
    }
    case "chip": {
      let x = el.x;
      if (el.icon) {
        out.push(icon(el.icon, x, el.y - 20, 40));
        x += 52;
      }
      out.push(`<text x="${x}" y="${el.y}" font-size="${UI}" fill="${C.ink}" dominant-baseline="central">${esc(el.text)}</text>`);
      x += textWidth(el.text, UI);
      if (el.chevron) {
        out.push(icon("chevDown", x + 10, el.y - 14, 28));
        x += 44;
      }
      box = [el.x - 10, el.y - 34, x - el.x + 20, 68];
      break;
    }
    case "input": {
      out.push(`<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" rx="20" fill="${C.card}" stroke="${C.line}" stroke-width="2"/>`);
      const cy = el.y + el.h / 2;
      out.push(icon("plus", el.x + 28, cy - 20, 40));
      out.push(`<text x="${el.x + 92}" y="${cy}" font-size="${UI}" fill="${C.faint}" dominant-baseline="central">${esc(el.text)}</text>`);
      out.push(icon("mic", el.x + el.w - 68, cy - 20, 40));
      box = [el.x, el.y, el.w, el.h];
      break;
    }
    case "menu": {
      const rowH = 76;
      const sepH = 24;
      const pad = 16;
      let y = el.y + pad;
      const rows = [];
      const marks = [];
      for (const r of el.rows) {
        if (r.sep) {
          rows.push(`<line x1="${el.x}" y1="${y + sepH / 2}" x2="${el.x + el.w}" y2="${y + sepH / 2}" stroke="${C.line}" stroke-width="2"/>`);
          y += sepH;
          continue;
        }
        const cy = y + rowH / 2;
        if (r.bar) rows.push(`<rect x="${el.x + 32}" y="${cy - 11}" width="${r.bar}" height="22" rx="11" fill="${C.bar}"/>`);
        else {
          if (r.mark) throw new Error("메뉴 줄의 mark는 아래 marks 배열로 처리한다");
          rows.push(`<text x="${el.x + 32}" y="${cy}" font-size="${UI}" font-weight="${r.bold ? 700 : 400}" fill="${r.tone === "sub" ? C.sub : r.tone === "faint" ? C.faint : C.ink}" dominant-baseline="central">${esc(r.text)}</text>`);
          if (r.chevron) rows.push(icon("chevRight", el.x + el.w - 64, cy - 16, 32));
          if (r.shortcut) rows.push(`<text x="${el.x + el.w - 32}" y="${cy}" font-size="${MIN_TEXT}" fill="${C.sub}" text-anchor="end" dominant-baseline="central">${esc(r.shortcut)}</text>`);
          const need = 32 + textWidth(r.text, UI, r.bold) + (r.chevron ? 80 : 0) + (r.shortcut ? textWidth(r.shortcut, MIN_TEXT) + 56 : 0) + 24;
          if (need > el.w) throw new Error(`메뉴 폭이 좁아요: "${r.text}" 줄에 ${Math.ceil(need)}px 필요 (지금 ${el.w}px)`);
        }
        if (r.selected) rows.unshift(`<rect x="${el.x + 8}" y="${y + 4}" width="${el.w - 16}" height="${rowH - 8}" rx="12" fill="${C.soft}"/>`);
        if (r.markN) marks.push({ n: r.markN, box: [el.x + 8, y + 4, el.w - 16, rowH - 8], style: "fill", side: r.badge ?? "right", edge: [el.x, el.x + el.w] });
        y += rowH;
      }
      const h = y + pad - el.y;
      out.push(`<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${h}" rx="16" fill="${C.card}" stroke="${C.line}" stroke-width="2"/>`);
      out.push(...rows);
      box = [el.x, el.y, el.w, h];
      return { svg: out.join("\n"), box, marks };
    }
    default:
      throw new Error(`없는 요소 종류: ${el.type}`);
  }
  if (el.mark) markBox = box;
  return { svg: out.join("\n"), box, marks: el.mark ? [{ n: el.mark, box: markBox, side: el.badge ?? "corner" }] : [] };
}

/** 번호표 자리: corner = 테두리 오른쪽 위 바깥, right/left = 메뉴 줄 바깥 옆 */
function badgeCenter(m) {
  const [x, y, w, h] = m.box;
  if (m.side === "right") return [(m.edge ? m.edge[1] : x + w) + 40, y + h / 2];
  if (m.side === "left") return [(m.edge ? m.edge[0] : x) - 40, y + h / 2];
  return [x + w + 20, y - 20];
}

function badge(n, cx, cy, accent, onAccent) {
  return `<circle cx="${cx}" cy="${cy}" r="28" fill="${accent}"/><text x="${cx}" y="${cy + 1}" font-size="30" font-weight="800" fill="${onAccent}" text-anchor="middle" dominant-baseline="central">${n}</text>`;
}

function render(spec, accent, onAccent, name) {
  const drawn = spec.items.map(draw);
  const marks = drawn.flatMap((d) => d.marks);
  if (marks.length > 3) throw new Error(`${name}: 강조가 ${marks.length}곳이에요 (3곳까지)`);
  const notes = spec.notes ?? [];
  const markNs = marks.map((m) => m.n).sort().join(",");
  const noteNs = notes.map((n) => n.n).sort().join(",");
  if (markNs !== noteNs) throw new Error(`${name}: 강조 번호(${markNs})와 설명 번호(${noteNs})가 달라요`);

  // 화면 조각 묶음의 범위 (강조 테두리와 번호표까지 포함)
  const boxes = drawn.map((d) => d.box);
  for (const m of marks) {
    const b = badgeCenter(m);
    boxes.push([b[0] - 30, b[1] - 30, 60, 60]);
  }
  const minX = Math.min(...boxes.map((b) => b[0]));
  const minY = Math.min(...boxes.map((b) => b[1]));
  const maxX = Math.max(...boxes.map((b) => b[0] + b[2]));
  const maxY = Math.max(...boxes.map((b) => b[1] + b[3]));
  const cw = maxX - minX;
  const ch = maxY - minY;

  const rowH = 96;
  const notesW = notes.length ? 56 + 20 + Math.max(...notes.map((n) => textWidth(n.text, NOTE, true))) : 0;
  const notesH = notes.length * rowH - (rowH - 56);
  const below = spec.layout === "below";
  const groupW = below ? Math.max(cw, notesW) : cw + (notes.length ? GAP + notesW : 0);
  const groupH = below ? ch + (notes.length ? GAP + notesH : 0) : Math.max(ch, notesH);
  if (groupW > W - MARGIN * 2 || groupH > H - MARGIN * 2) {
    throw new Error(`${name}: 묶음이 캔버스보다 커요 (${Math.round(groupW)}×${Math.round(groupH)}, 최대 ${W - MARGIN * 2}×${H - MARGIN * 2}). 화면 조각을 줄이세요`);
  }
  const gx = (W - groupW) / 2;
  const gy = (H - groupH) / 2;
  const dx = gx - minX + (below ? (groupW - cw) / 2 : 0);
  const dy = gy - minY + (below ? 0 : (groupH - ch) / 2);

  const parts = [];
  parts.push(`<rect width="${W}" height="${H}" fill="${C.bg}"/>`);
  parts.push(`<g transform="translate(${dx} ${dy})">`);
  parts.push(...drawn.map((d) => d.svg));
  for (const m of marks) {
    const [x, y, w, h] = m.box;
    if (m.style === "fill") {
      // 메뉴 줄: 붙어 있는 줄끼리 테두리가 겹치지 않게 옅게 채운다
      parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${accent}" fill-opacity="0.16" stroke="${accent}" stroke-width="3"/>`);
    } else {
      parts.push(`<rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${h + 16}" rx="14" fill="none" stroke="${accent}" stroke-width="4"/>`);
    }
    const [bx, by] = badgeCenter(m);
    parts.push(badge(m.n, bx, by, accent, onAccent));
  }
  parts.push(`</g>`);

  if (notes.length) {
    const nx = below ? gx + (groupW - notesW) / 2 : gx + cw + GAP;
    const ny = below ? gy + ch + GAP : gy + (groupH - notesH) / 2;
    notes.forEach((note, i) => {
      const cy = ny + 28 + i * rowH;
      parts.push(badge(note.n, nx + 28, cy, accent, onAccent));
      parts.push(`<text x="${nx + 76}" y="${cy}" font-size="${NOTE}" font-weight="700" fill="${C.ink}" dominant-baseline="central">${esc(note.text)}</text>`);
    });
  }
  parts.push(`<text x="${W - 28}" y="${H - 28}" font-size="22" fill="${C.faint}" text-anchor="end">설명용 목업</text>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="${FONT}">\n<title>${esc(spec.alt ?? name)}</title>\n${parts.join("\n")}\n</svg>\n`;
}

const slug = process.argv[2];
if (!slug) {
  console.error("사용법: node scripts/mockup.mjs <slug>");
  process.exit(2);
}
const bookPath = join("src", "books", slug, "book.json");
const figDir = join("src", "books", slug, "figures");
if (!existsSync(bookPath) || !existsSync(figDir)) {
  console.error(`${bookPath} 또는 ${figDir} 가 없어요`);
  process.exit(2);
}
const book = JSON.parse(readFileSync(bookPath, "utf8"));
const outDir = join("public", "books", slug);
mkdirSync(outDir, { recursive: true });
let failed = 0;
for (const file of readdirSync(figDir).filter((f) => f.endsWith(".json")).sort()) {
  const name = file.replace(/\.json$/, "");
  try {
    const spec = JSON.parse(readFileSync(join(figDir, file), "utf8"));
    // 메뉴 줄의 mark는 markN으로 옮겨 menu 안에서 처리한다
    for (const el of spec.items) if (el.type === "menu") for (const r of el.rows) if (r.mark) { r.markN = r.mark; delete r.mark; }
    const svg = render(spec, book.accent, book.onAccent ?? "#FFFFFF", name);
    writeFileSync(join(outDir, `${name}.svg`), svg);
    console.log(`✓ ${name}.svg (${Math.round(svg.length / 1024)}KB)`);
  } catch (e) {
    failed++;
    console.log(`✗ ${name}: ${e.message}`);
  }
}
process.exit(failed ? 1 : 0);
