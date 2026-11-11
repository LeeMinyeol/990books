import Image from "next/image";
import type { ShelfItem } from "@/lib/book";

/** 16:10 표지. 이미지가 없으면 제목을, 준비 중이면 "준비 중"을 보여준다 */
export default function BookCover({
  item,
  sizes,
  priority = false,
  className = "rounded-2xl",
}: {
  item: ShelfItem;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const src = item.cover?.src;
  return (
    <div
      className={`relative aspect-[16/10] w-full overflow-hidden bg-panel ${className} ${
        item.status === "coming" ? "border border-dashed border-neutral-300" : ""
      }`}
    >
      {item.status === "coming" ? (
        <span className="type-label absolute inset-0 flex items-center justify-center text-sub">
          준비 중
        </span>
      ) : src ? (
        <Image
          src={src}
          alt={item.cover?.alt ?? ""}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={src.endsWith(".svg")}
          className="object-cover"
        />
      ) : (
        <span className="type-title absolute inset-0 flex items-center justify-center px-6 text-center text-accent-ink">
          {item.title}
        </span>
      )}
    </div>
  );
}
