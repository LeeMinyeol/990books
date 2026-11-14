import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allPages, getBook, viewerPages, visibleBooks } from "@/books/content";
import BookViewer from "@/components/viewer/BookViewer";
import { getAccess } from "@/lib/access";
import { KINDS, formatPrice } from "@/lib/pricing";

export const instant = false;

export function generateStaticParams() {
  return visibleBooks().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/books/[slug]/read">): Promise<Metadata> {
  const { slug } = await params;
  const book = getBook(slug);
  // 책 본문은 검색에 걸리지 않게 한다
  return book ? { title: `${book.title} | 99BOOKS`, robots: { index: false } } : {};
}

/** 뷰어. 서버가 볼 수 있는 장만 골라서 보낸다(결제 전에는 앞 3장과 잠금 안내) */
export default async function ReadPage({ params }: PageProps<"/books/[slug]/read">) {
  const { slug } = await params;
  const book = getBook(slug);
  if (!book) notFound();
  const access = getAccess();
  return (
    <BookViewer
      book={{ slug: book.slug, title: book.title, accent: book.accent, onAccent: book.onAccent }}
      pages={viewerPages(book, access.full)}
      totalPages={allPages(book).length}
      price={formatPrice(KINDS[book.kind].price)}
      watermark={access.watermark}
    />
  );
}
