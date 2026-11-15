import Image from "next/image";
import type { ReactNode } from "react";
import type { Block } from "@/lib/blocks";
import PromptBox from "@/components/viewer/PromptBox";
import MotionFigure from "./MotionFigure";

/** **굵게**와 `글자 그대로`만 지원하는 가벼운 렌더러 */
export function Rich({ text }: { text: string }): ReactNode {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("**")) {
      return (
        <strong key={i} className="font-bold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`")) {
      return (
        <code key={i} className="rounded bg-panel px-1.5 py-0.5 font-sans font-bold text-ink">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "h2":
      return (
        <h2 id={block.id} className="type-heading mt-8 scroll-mt-6 border-l-4 border-accent pl-3 text-ink first:mt-0">
          {block.text}
        </h2>
      );
    case "h3":
      return <h3 className="type-title mt-3 text-ink">{block.text}</h3>;
    case "p":
      return (
        <p className="type-body text-ink">
          <Rich text={block.text} />
        </p>
      );
    case "ul":
      return (
        <ul className="type-body flex flex-col gap-2 text-ink">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
              <span>
                <Rich text={item} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="type-body flex flex-col gap-2 text-ink">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="type-label mt-[0.2em] w-5 shrink-0 text-accent-ink tabular-nums">{i + 1}</span>
              <span>
                <Rich text={item} />
              </span>
            </li>
          ))}
        </ol>
      );
    case "check":
      return (
        <ul className="flex flex-col gap-1 rounded-2xl bg-panel p-3">
          {block.items.map((item, i) => (
            <li key={i}>
              <label className="type-body flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 text-ink">
                <input type="checkbox" className="h-5 w-5 shrink-0 accent-(--accent)" />
                <span>
                  <Rich text={item} />
                </span>
              </label>
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        // 표를 옆으로 미는 동작이 장 넘김으로 읽히지 않게 표시해 둔다
        <div data-noswipe className="overflow-x-auto rounded-2xl border border-line">
          <table className="type-small w-full min-w-[30rem] border-collapse text-left text-ink">
            <thead>
              <tr className="bg-panel">
                {block.head.map((h, i) => (
                  <th key={i} scope="col" className="whitespace-nowrap px-4 py-3 font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className="border-t border-line align-top">
                  {row.map((cell, c) => (
                    <td key={c} className="min-w-24 px-4 py-3">
                      <Rich text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "prompt":
      return <PromptBox label={block.label} text={block.text} />;
    case "image":
      if (block.image.src?.endsWith(".mp4")) return <MotionFigure src={block.image.src} alt={block.image.alt} />;
      return (
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-line bg-panel">
          {block.image.src ? (
            <Image
              src={block.image.src}
              alt={block.image.alt}
              fill
              sizes="(min-width: 1024px) 680px, 100vw"
              unoptimized={block.image.src.endsWith(".svg")}
              className="object-cover"
              draggable={false}
            />
          ) : (
            <span className="type-small absolute inset-0 flex items-center justify-center px-6 text-center text-sub">
              {block.image.alt}
            </span>
          )}
        </div>
      );
    case "quote":
      return (
        <blockquote className="type-body border-l-4 border-line pl-4 text-sub">
          <Rich text={block.text} />
        </blockquote>
      );
  }
}

/** 긴 글 본문. 긴 글형 책 챕터와 오늘의 칼럼이 같이 쓴다 */
export default function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  );
}
