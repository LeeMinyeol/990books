import type { ParsedDoc } from "@/lib/blocks";
import Blocks from "@/components/content/Blocks";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

/** 소개·이용 안내 같은 사이트 안내 페이지의 틀(docs/wireframe.md 3-10) */
export default function InfoPage({ doc }: { doc: ParsedDoc }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[42.5rem] flex-1 px-5 pb-16 pt-10 lg:pt-14">
        <article>
          <h1 className="type-display text-balance text-ink">{doc.title}</h1>
          {doc.meta.summary && <p className="type-body mt-4 text-sub">{doc.meta.summary}</p>}
          <div className="mt-8 border-t border-line pt-8">
            <Blocks blocks={doc.blocks} />
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
