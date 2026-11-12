// 검사 스크립트가 함께 쓰는 글자 처리와 금지 표현 목록.
// 표현 규칙의 설명은 docs/writing-style.md 7장에 있다.

// 이모지. ©, ™, ↔ 같은 글자 기호는 이모지로 세지 않는다
export const EMOJI = /\p{Emoji_Presentation}|\p{Extended_Pictographic}️/gu;

// 아직 채우지 않았다는 표시. 공개할 글에 남아 있으면 안 된다
export const PLACEHOLDER = /확인 ?필요|미정|추후 ?확정|TBD|TODO/;

export function splitSentences(text) {
  return text
    .replace(/(\d{1,4})\.\s+(?=\d{1,2}(\D|$))/g, "$1.") // "2026. 11. 05." 같은 날짜를 문장으로 쪼개지 않는다
    .split(/(?<=[.!?…])["'”’)]*\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);
}

export function ending(sentence) {
  const t = sentence.replace(/["'”’)\s]+$/, "");
  if (/\?$/.test(t)) return "question";
  if (/(니다|니까)[.!]*$/.test(t)) return "hamnida";
  if (/(요|죠)[.!~]*$/.test(t)) return "haeyo";
  if (/다[.!]*$/.test(t)) return "handa";
  return "etc";
}

// 불합격 표현. negatable 이 true 인 것은 바로 뒤에 부정("~하지 않아요")이 오면 넘어간다
export const BANNED = [
  { re: /여러 ?분(?=[도은이께의들을,.!?\s]|$)/g, why: '"여러분" 금지. 독자의 상황으로 부른다' },
  { re: /(수익|매출|조회수|성공|합격|효과)[^.\n]{0,12}보장/g, why: "수익·성공 보장 표현 금지", negatable: true },
  { re: /누구나 (쉽게|할 수)/g, why: "과장 표현 금지", negatable: true },
  { re: /무조건|100\s?% ?(성공|효과)|단 \d+(분|일) ?만에 (월|수익)|인생을 바꾸/g, why: "과장 표현 금지" },
  { re: /월 ?\d+ ?(만|천만|억) ?원 ?(수익|매출|벌|버는)/g, why: "수익 금액으로 후킹 금지" },
  { re: /직접 (해|써|만들어|돌려|사용해|이용해|따라 해|테스트해|실험해|확인해) ?(봤|보았|보니|본 결과)|해 ?보지는 않았/g, why: '"직접 해 봤다/안 해 봤다" 언급 금지' },
  { re: /(매수|매도) ?(타이밍|시점|추천)|(오를|사야 할|살 만한|추천) ?(종목|코인)|종목 ?추천|급등주|수익률 ?\d/g, why: "투자 종목·시점·수익률 언급 금지" },
];

// 주의 표현: 문맥상 필요하면 남길 수 있다
export const WEAK = [
  { re: /(살펴|알아)보겠습니다|(살펴|알아)볼게요|에 대해 알아보자/g, why: "예고만 하는 문장. 바로 내용을 쓴다" },
  { re: /결론적으로|요약하자면|정리하자면|마지막으로,/g, why: "상투적 접속 표현" },
  { re: /라고 할 수 있(습니다|어요)|라고 볼 수 있(습니다|어요)|것으로 보입니다/g, why: "돌려 말하기. 단정하거나 근거를 댄다" },
  { re: /다양한|혁신적|획기적|놀라운|핵심적인|효과적으로|매우 중요/g, why: "뜻이 비어 있는 꾸밈말" },
  { re: /단순히 [^.\n]{1,30}(이|가) 아니라/g, why: '"단순히 A가 아니라 B" 틀' },
  { re: /하는 것이 (중요|필요)합니다|하는 것이 좋습니다/g, why: "누가 무엇을 하는지로 다시 쓴다" },
];

const NEGATED = /^[^.!?\n]{0,14}(지 않|않아|않습|않는|아니에|아니라|아닙|없어|없습|없는|금지|못 ?해)/;

/**
 * 금지·주의 표현을 찾는다. 따옴표 안은 인용이나 나쁜 예시일 수 있어서 보지 않는다.
 * @returns {{level: "fail"|"warn", found: string[], count: number, why: string}[]}
 */
export function scanPhrases(raw, { banned = BANNED, weak = WEAK } = {}) {
  const text = raw.replace(/"[^"\n]*"|“[^”\n]*”/g, "");
  const out = [];
  const collect = (list, level) => {
    for (const { re, why, negatable } of list) {
      const found = [];
      for (const m of text.matchAll(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"))) {
        if (negatable && NEGATED.test(text.slice(m.index + m[0].length))) continue;
        found.push(m[0]);
      }
      if (found.length) out.push({ level, found: [...new Set(found)], count: found.length, why });
    }
  };
  collect(banned, "fail");
  collect(weak, "warn");
  return out;
}

export function countEmoji(raw) {
  return (raw.match(EMOJI) || []).length;
}
