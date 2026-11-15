import Image from "next/image";
import type { ReactNode } from "react";
import type { Block, StepBlock } from "@/lib/blocks";
import PromptBox from "@/components/viewer/PromptBox";
import MotionFigure from "./MotionFigure";
import StepList, { Fold, type StepCardData } from "./StepList";

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
        <h2 id={block.id} className="type-heading mt-10 scroll-mt-6 text-balance text-ink first:mt-0">
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
      // 증상·원인·해결 표는 증상별 접는 칸으로 그린다(모바일에서 옆으로 밀지 않게)
      if (block.head.join("|") === "증상|원인|해결") {
        return (
          <div className="flex flex-col gap-2">
            {block.rows.map((row, r) => (
              <Fold key={r} label={row[0]}>
                <p className="type-body text-ink">
                  <span className="type-label mr-2 text-sub">원인</span>
                  <Rich text={row[1] ?? ""} />
                </p>
                <p className="type-body text-ink">
                  <span className="type-label mr-2 text-accent-ink">해결</span>
                  <Rich text={row[2] ?? ""} />
                </p>
              </Fold>
            ))}
          </div>
        );
      }
      // 나쁜 예·좋은 예 표는 비교 카드로 그린다(모바일에서 옆으로 밀지 않게)
      if (block.head[0] === "구분" && block.rows.every((r) => r[0] === "나쁜 예" || r[0] === "좋은 예")) {
        return (
          <div className="flex flex-col gap-3">
            {block.rows.map((row, r) => {
              const good = row[0] === "좋은 예";
              return (
                <div
                  key={r}
                  className={`rounded-2xl px-4 py-3 ${good ? "border border-accent bg-accent-soft" : "border border-line bg-panel"} ${
                    good && r > 0 ? "-mt-1" : ""
                  } ${!good && r > 0 ? "mt-3" : ""}`}
                >
                  <p className={`type-label ${good ? "text-accent-ink" : "text-sub"}`}>{row[0]}</p>
                  <p className="type-body mt-1 text-ink">
                    <Rich text={row[1] ?? ""} />
                  </p>
                  {row[2] && (
                    <p className="type-small mt-1 text-sub">
                      <span aria-hidden>→ </span>
                      <Rich text={row[2]} />
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        );
      }
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
                    // 좁은 화면에서 긴 칸이 한 글자씩 꺾이지 않게 칸마다 최소 폭을 둔다(넘치면 표를 옆으로 민다)
                    <td key={c} className="min-w-40 px-4 py-3">
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

function toCard(step: StepBlock): StepCardData {
  const list = (items: Block[]) => (items.length ? items.map((b, i) => <BlockView key={i} block={b} />) : null);
  return {
    no: step.no,
    title: step.title,
    action: <Rich text={step.action} />,
    visible: list(step.visible),
    success: step.success.map((t, i) => <Rich key={i} text={t} />),
    trouble: step.trouble.map((t, i) => <Rich key={i} text={t} />),
    more: list(step.more),
  };
}

/** 긴 글 본문. 긴 글형 책 챕터와 오늘의 칼럼이 같이 쓴다. 이어지는 단계 카드는 한 묶음으로 그린다 */
export default function Blocks({ blocks }: { blocks: Block[] }) {
  const out: ReactNode[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.type === "step") {
      const group: StepBlock[] = [];
      while (i < blocks.length && blocks[i].type === "step") group.push(blocks[i++] as StepBlock);
      i--;
      out.push(<StepList key={`steps-${i}`} steps={group.map(toCard)} />);
    } else out.push(<BlockView key={i} block={block} />);
  }
  return <div className="flex flex-col gap-5">{out}</div>;
}
