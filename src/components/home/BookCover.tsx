import Image from "next/image";
import type { ShelfItem } from "@/lib/book";

/** 16:10 표지. 이미지가 없으면 제목을, 준비 중이면 "준비 중"을 보여준다 */
export default function BookCover({
  item,
  sizes,
  priority = false,
}: {
  item: ShelfItem;
  sizes: string;
  priority?: boolean;
}) {
  const src = item.cover?.src;
  return (
    <div
      className={`relative aspect-[16/10] w-full overflow-hidden rounded-xl border ${
        item.status === "coming"
          ? "border-dashed border-neutral-300 bg-neutral-100"
          : "border-line bg-accent-soft"
      }`}
    >
      {item.status === "coming" ? (
        <span className="absolute inset-0 flex items-center justify-center font-title text-2xl text-neutral-500">
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
        <span className="absolute inset-0 flex items-center justify-center px-6 text-center font-title text-xl text-accent">
          {item.title}
        </span>
      )}
    </div>
  );
}
