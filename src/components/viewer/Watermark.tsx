/**
 * 구매자 이메일 워터마크. 뷰어 틀 위에 옅게 비스듬히 반복한다.
 * 읽기를 가리지 않도록 아주 옅게 두고, 누르거나 선택할 수 없게 한다.
 * 글자는 서버가 정해서 보낸다(무료 구간에는 넣지 않는다).
 */
export default function Watermark({ text }: { text: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10 select-none overflow-hidden">
      <div className="absolute -inset-1/3 flex -rotate-[24deg] flex-wrap content-center justify-center gap-x-20 gap-y-24 opacity-[0.07]">
        {Array.from({ length: 60 }, (_, i) => (
          <span key={i} className="type-label whitespace-nowrap text-ink">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
