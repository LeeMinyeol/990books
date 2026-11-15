import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBook, visibleBooks } from "@/books/content";
import DetailPage from "@/components/detail/DetailPage";

export const instant = false;

export function generateStaticParams() {
  const slugs = visibleBooks().map((b) => ({ slug: b.slug }));
  // 공개된 책이 하나도 없어도 빌드가 멈추지 않게 한다(Cache Components는 1개 이상을 요구한다). 없는 주소는 404가 된다
  return slugs.length ? slugs : [{ slug: "none" }];
}

export async function generateMetadata({ params }: PageProps<"/books/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const book = getBook(slug);
  if (!book) return {};
  const cover = book.slides.find((s) => s.type === "cover");
  return {
    title: `${book.title} | 99BOOKS`,
    description: book.summary ?? (cover?.type === "cover" ? cover.subtitle : undefined),
  };
}

/** 책 상세페이지(판매 페이지). 책 본문은 /books/<slug>/read 에서 본다 */
export default async function BookDetailPage({ params }: PageProps<"/books/[slug]">) {
  const { slug } = await params;
  const book = getBook(slug);
  if (!book) notFound();
  return <DetailPage book={book} />;
}
