/**
 * 구매자 이메일 워터마크. 읽기를 가리지 않는 것이 먼저다.
 * - 글자 아래 층에 깔고(뷰어 틀이 z-[1]로 위에 올린다), 화면 한 장에 세 번만 아주 옅게 둔다.
 * - 틀에 고정되어 있어서 긴 글을 스크롤해도 화면 어디를 캡처하든 하나 이상 들어간다.
 * - 화면에서는 거의 안 보이지만 캡처본의 대비를 올리면 또렷해진다.
 * 웹에서는 캡처하는 순간을 알 수 없어서, "캡처할 때만 보이기"는 하지 않는다.
 * 글자는 서버가 정해서 보낸다. 무료 구간에는 BookViewer가 넣지 않는다.
 */
const SPOTS = [
  "left-[6%] top-[22%]",
  "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
  "right-[6%] top-[78%]",
];

export default function Watermark({ text }: { text: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden">
      {SPOTS.map((pos) => (
        <span
          key={pos}
          className={`type-label absolute whitespace-nowrap text-ink opacity-[0.045] ${pos}`}
        >
          <span className="inline-block -rotate-[18deg]">{text}</span>
        </span>
      ))}
    </div>
  );
}

/** 장 끝에 붙는 열람자 표시 한 줄. 본문이 끝난 뒤라 읽기를 방해하지 않는다 */
export function ReaderLine({ text }: { text: string }) {
  return (
    <p className="type-caption mt-auto px-6 pb-6 pt-10 text-center text-sub/60">
      {text} 계정으로 열람 중이에요 · 무단 배포 금지
    </p>
  );
}
