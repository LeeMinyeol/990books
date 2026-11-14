import Link from "next/link";
import SoonButton from "@/components/home/SoonButton";
import type { LockedPage } from "@/lib/book";
import { PAYMENT_SOON, REFUND_SHORT } from "@/lib/policy";

/** 한 번에 보여주는 남은 장 제목 수 */
const OUTLINE_MAX = 6;

/** 결제 전 뷰어의 마지막 화면. 남은 장의 제목만 있고 내용은 서버가 보내지 않는다 */
export default function LockedView({ page, price, detailHref }: { page: LockedPage; price: string; detailHref: string }) {
  const more = page.outline.length - OUTLINE_MAX;
  return (
    <div className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-8 px-6 py-8 lg:grid-cols-2 lg:gap-12 lg:px-14">
      <div>
        <p className="type-label text-accent-ink">여기까지가 무료예요</p>
        <h2 className="type-display mt-2 text-balance text-ink">남은 {page.remaining}장도 이어서 보세요</h2>
        {page.inputs > 0 && (
          <p className="type-body mt-4 text-sub">
            남은 장에 복사해 쓰는 입력값 <b className="text-ink">{page.inputs}개</b>가 들어 있어요.
          </p>
        )}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <SoonButton
            align="left"
            up
            message={PAYMENT_SOON}
            className="type-label min-h-13 rounded-full bg-accent px-7 text-on-accent outline-offset-2 transition hover:brightness-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-ink"
          >
            전체 보기 {price}
          </SoonButton>
          <Link
            href={detailHref}
            className="type-label flex min-h-13 items-center rounded-full border-2 border-ink px-7 text-ink outline-offset-2 transition hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-ink"
          >
            책 소개 보기
          </Link>
        </div>
        <p className="type-small mt-3 text-sub">{REFUND_SHORT}</p>
      </div>

      <div className="rounded-3xl bg-accent-soft p-6 lg:p-7">
        <p className="type-label text-accent-ink">남은 장</p>
        <ul className="type-small mt-3 flex flex-col gap-2 text-ink">
          {page.outline.slice(0, OUTLINE_MAX).map((title) => (
            <li key={title} className="flex gap-3">
              <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
              {title}
            </li>
          ))}
          {more > 0 && <li className="pl-[1.125rem] text-sub">외 {more}장</li>}
        </ul>
      </div>
    </div>
  );
}
