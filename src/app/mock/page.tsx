// 시안(임시): 어두운 헤더 + 오렌지 포인트. 확정되면 홈에 반영하고 이 파일은 지운다.
// 가격·제목·읽을거리 문구는 전부 예시 값이다.

const ORANGE = "#FF6A33";
const cats = ["전체", "AI", "주식·코인", "부동산", "유튜브", "노션", "데이터 분석", "웹 개발", "그림", "운동", "요리"];
const includes = ["따라 하기 슬라이드 28장", "복사해 쓰는 프롬프트 12개", "30일 계획표 시트 (구글 시트 사본)"];
const posts = [
  { cat: "AI 트렌드", title: "챗GPT에 광고가 붙으면 검색 습관은 어떻게 바뀔까", date: "11.10" },
  { cat: "써 봤어요", title: "회의록 정리 AI 3개에 같은 녹음을 넣어 봤어요", date: "11.08" },
  { cat: "유튜브", title: "쇼츠 첫 3초, 잘되는 채널 20개를 세어 봤어요", date: "11.06" },
];
const books = [
  { kind: "실전 키트", price: "4,900원", title: "클로드로 인스타 한 달치 콘텐츠, 하루 만에 뽑기", facts: "슬라이드 28장, 프롬프트 12개, 시트 1개" },
  { kind: "미니북", price: "990원", title: "노션으로 가계부 10분 만에 만들기", facts: "슬라이드 12장, 템플릿 1개" },
  { kind: "실전 키트", price: "준비 중", title: "스마트스토어 상세페이지, 클로드로 한 번에 만들기", facts: "" },
];

function Calendar({ small = false }: { small?: boolean }) {
  const on = [1, 4, 9, 12, 14, 17, 23, 26];
  return (
    <div className={`grid grid-cols-7 ${small ? "gap-1" : "gap-2"}`}>
      {Array.from({ length: 28 }, (_, i) => (
        <span
          key={i}
          className={`aspect-[4/3] ${small ? "rounded-[3px]" : "rounded-md"}`}
          style={{ background: on.includes(i) ? ORANGE : "#EDEBE8" }}
        />
      ))}
    </div>
  );
}

export default function Mock() {
  return (
    <div className="min-h-dvh bg-white text-[#141414]">
      <header className="bg-[#1C1C1C] text-white">
        <div className="mx-auto flex h-16 max-w-[1160px] items-center gap-9 px-6">
          <span className="text-[22px] font-black tracking-tight">99BOOKS</span>
          <nav className="flex items-center gap-7 text-[15px] font-bold">
            <span>전자책</span>
            <span className="flex items-center gap-1.5 text-white/70">
              읽을거리
              <span className="rounded px-1.5 py-0.5 text-[11px] text-[#1C1C1C]" style={{ background: ORANGE }}>무료</span>
            </span>
          </nav>
          <div className="ml-auto flex h-10 w-72 items-center rounded-full bg-white/10 px-4 text-sm text-white/50">
            만들고 싶은 결과물을 찾아보세요
          </div>
          <span className="flex h-10 items-center rounded-full px-5 text-sm font-bold text-[#1C1C1C]" style={{ background: ORANGE }}>
            로그인
          </span>
        </div>
      </header>

      <div className="border-b border-[#E7E5E2]">
        <div className="mx-auto flex h-12 max-w-[1160px] items-center gap-7 px-6 text-[15px] text-[#5E5B57]">
          {cats.map((c, i) => (
            <span key={c} className={i === 1 ? "flex h-full items-center border-b-2 font-bold text-[#141414]" : ""} style={i === 1 ? { borderColor: ORANGE } : undefined}>
              {c}
            </span>
          ))}
        </div>
      </div>

      <section className="mx-auto grid max-w-[1160px] grid-cols-[1.05fr_1fr] items-center gap-14 px-6 py-14">
        <div>
          <p className="text-sm font-bold text-[#5E5B57]">AI, 인스타그램</p>
          <h1 className="mt-3 text-balance text-[44px] font-black leading-[1.22] tracking-tight">
            클로드로 인스타 한 달치 콘텐츠, 하루 만에 뽑기
          </h1>
          <ul className="mt-6 flex flex-col gap-2 text-[17px]">
            {includes.map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0" aria-hidden>
                  <circle cx="10" cy="10" r="10" fill={ORANGE} />
                  <path d="m5.5 10.2 3 3 6-6.4" fill="none" stroke="#1C1C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-[#5E5B57]">따라 하는 데 30분, 추가 비용 0원, 2026년 11월 10일에 직접 따라 해 보고 확인했어요</p>
          <div className="mt-8 flex gap-3">
            <span className="flex h-14 items-center rounded-full px-7 text-[17px] font-bold text-[#1C1C1C]" style={{ background: ORANGE }}>
              앞 3장 무료로 보기
            </span>
            <span className="flex h-14 items-center rounded-full border-2 border-[#141414] px-7 text-[17px] font-bold">
              전체 받기 4,900원
            </span>
          </div>
        </div>
        <div className="rounded-3xl bg-[#F4F3F1] p-8">
          <div className="rounded-2xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-black">11월 콘텐츠 계획표</span>
              <span className="rounded-full px-3 py-1 text-xs font-bold text-[#1C1C1C]" style={{ background: ORANGE }}>30일 완성</span>
            </div>
            <Calendar />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-xs font-bold text-[#5E5B57]">
            {["슬라이드", "프롬프트", "계획표 시트"].map((t) => (
              <div key={t} className="rounded-xl bg-white p-3">
                <div className="mb-2 flex flex-col gap-1.5">
                  <span className="h-1.5 w-full rounded bg-[#E3E0DC]" />
                  <span className="h-1.5 w-2/3 rounded bg-[#E3E0DC]" />
                </div>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#E7E5E2] bg-[#FAF9F8]">
        <div className="mx-auto max-w-[1160px] px-6 py-10">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-black tracking-tight">이번 주 읽을거리</h2>
            <span className="text-sm font-bold text-[#5E5B57]">전부 무료예요</span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-5">
            {posts.map((p) => (
              <article key={p.title} className="rounded-2xl bg-white p-6">
                <p className="text-sm font-bold" style={{ color: "#C8440F" }}>{p.cat}</p>
                <h3 className="mt-2 text-balance text-[19px] font-extrabold leading-snug">{p.title}</h3>
                <p className="mt-4 text-sm text-[#5E5B57]">{p.date}, 3분이면 읽어요</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1160px] px-6 py-12">
        <h2 className="text-2xl font-black tracking-tight">전자책</h2>
        <div className="mt-5 grid grid-cols-3 gap-6">
          {books.map((b) => (
            <article key={b.title}>
              <div className="relative rounded-2xl bg-[#F4F3F1] p-6">
                <div className={`rounded-xl bg-white p-4 ${b.price === "준비 중" ? "opacity-40" : ""}`}>
                  <Calendar small />
                </div>
                <span className="absolute left-4 top-4 rounded-full bg-[#1C1C1C] px-3 py-1 text-xs font-bold text-white">{b.kind}</span>
              </div>
              <h3 className="mt-4 text-balance text-[19px] font-extrabold leading-snug">{b.title}</h3>
              {b.facts && <p className="mt-2 text-sm text-[#5E5B57]">{b.facts}</p>}
              <p className="mt-2 text-[17px] font-black">{b.price}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
