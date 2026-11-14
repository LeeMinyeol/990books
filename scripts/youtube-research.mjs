#!/usr/bin/env node
// 유튜브 검색 결과(조회수순)를 모아 JSON으로 출력한다. 조사 시트에 적기 전 단계다.
//
// 사용법:
//   node scripts/youtube-research.mjs                      # 모든 분야, 이번 주, 검색어당 5개
//   node scripts/youtube-research.mjs --period month       # 이번 달
//   node scripts/youtube-research.mjs --category "데이터 분석" --limit 10
//   node scripts/youtube-research.mjs --min 10000          # 조회수 1만 미만 제외 (없으면 research-queries.json의 분야별 min)
//   node scripts/youtube-research.mjs --known ids.txt      # 이미 시트에 있는 영상 ID(줄마다 하나, 주소도 됨) 제외
//
// 출력: { collectedAt, period, items: [{ category, prefix, query, title, channel, views, published, length, id, url }], errors }
// 같은 영상이 여러 검색어에 나오면 처음 나온 것 하나만 남긴다.
// 로그인, API 키를 쓰지 않는다. 공개 검색 화면만 읽는다.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

// sp 값: 조회수순 정렬 + 업로드 날짜 필터 + 동영상만
const PERIOD_SP = {
  today: "CAMSBAgCEAE%3D",
  week: "CAMSBAgDEAE%3D",
  month: "CAMSBAgEEAE%3D",
};

function parseArgs(argv) {
  const opts = { period: "week", limit: 5, min: null, category: null, known: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === "--period") opts.period = next();
    else if (a === "--limit") opts.limit = Number(next());
    else if (a === "--min") opts.min = Number(next());
    else if (a === "--category") opts.category = next();
    else if (a === "--known") opts.known = next();
    else if (a === "--help" || a === "-h") {
      console.log(readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1, 13).join("\n"));
      process.exit(0);
    } else {
      console.error(`알 수 없는 옵션: ${a}`);
      process.exit(2);
    }
  }
  if (!PERIOD_SP[opts.period]) {
    console.error(`--period는 today, week, month 중 하나예요.`);
    process.exit(2);
  }
  return opts;
}

function loadKnown(path) {
  if (!path) return new Set();
  const ids = new Set();
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/(?:v=|youtu\.be\/|shorts\/)([\w-]{11})/) || line.trim().match(/^([\w-]{11})$/);
    if (m) ids.add(m[1]);
  }
  return ids;
}

function toNumber(text) {
  if (!text) return null;
  const digits = text.replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}

function extractInitialData(html) {
  const marker = "var ytInitialData = ";
  const start = html.indexOf(marker);
  if (start < 0) return null;
  const from = start + marker.length;
  const end = html.indexOf(";</script>", from);
  if (end < 0) return null;
  return JSON.parse(html.slice(from, end));
}

function collectVideos(data) {
  const out = [];
  const walk = (o) => {
    if (!o || typeof o !== "object") return;
    if (o.videoRenderer) {
      const v = o.videoRenderer;
      out.push({
        title: (v.title?.runs || []).map((r) => r.text).join(""),
        channel: v.ownerText?.runs?.[0]?.text || "",
        views: toNumber(v.viewCountText?.simpleText),
        published: v.publishedTimeText?.simpleText || "",
        length: v.lengthText?.simpleText || "",
        id: v.videoId,
      });
      return;
    }
    for (const k in o) walk(o[k]);
  };
  walk(data);
  return out;
}

// 연결이 끊기거나 일시적으로 막히면 3초, 8초 쉬고 다시 시도한다.
async function searchWithRetry(query, period) {
  const waits = [3000, 8000];
  for (let attempt = 0; ; attempt++) {
    try {
      return await search(query, period);
    } catch (e) {
      if (attempt >= waits.length) throw e;
      await new Promise((r) => setTimeout(r, waits[attempt]));
    }
  }
}

async function search(query, period) {
  const url =
    `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}` +
    `&sp=${PERIOD_SP[period]}&hl=ko&gl=KR`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
      "Accept-Language": "ko-KR,ko;q=0.9",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = extractInitialData(await res.text());
  if (!data) throw new Error("검색 결과 데이터를 찾지 못했어요 (화면 구조가 바뀌었을 수 있어요)");
  return collectVideos(data);
}

function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const config = JSON.parse(readFileSync(join(here, "research-queries.json"), "utf8"));
  const known = loadKnown(opts.known);
  const categories = config.categories.filter((c) => !opts.category || c.name === opts.category);
  if (categories.length === 0) {
    console.error(`분야를 찾지 못했어요: ${opts.category}`);
    process.exit(2);
  }

  const seen = new Set(known);
  const items = [];
  const errors = [];
  for (const cat of categories) {
    for (const query of cat.queries) {
      try {
        const videos = await searchWithRetry(query, opts.period);
        let taken = 0;
        for (const v of videos) {
          if (taken >= opts.limit) break;
          if (!v.id || seen.has(v.id)) continue;
          if (v.views === null) continue;
          if (v.views < (opts.min ?? cat.min ?? 0)) continue;
          seen.add(v.id);
          taken++;
          items.push({
            category: cat.name,
            prefix: cat.prefix,
            query,
            ...v,
            url: `https://www.youtube.com/watch?v=${v.id}`,
          });
        }
      } catch (e) {
        errors.push({ query, error: String(e.message || e) });
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  console.log(JSON.stringify({ collectedAt: today(), period: opts.period, items, errors }, null, 1));
  if (items.length === 0 && errors.length > 0) process.exit(1);
}

main();
