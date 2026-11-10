import { notFound } from "next/navigation";
import BookViewer from "@/components/viewer/BookViewer";
import { books, getBook } from "@/books";

export const instant = false;

export function generateStaticParams() {
  return books.map((b) => ({ slug: b.slug }));
}

export default async function BookPage({ params }: PageProps<"/books/[slug]">) {
  const { slug } = await params;
  const book = getBook(slug);
  if (!book) notFound();
  return <BookViewer book={book} />;
}
