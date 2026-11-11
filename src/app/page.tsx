import { shelf } from "@/books";
import BookShelf from "@/components/home/BookShelf";
import HeroCarousel from "@/components/home/HeroCarousel";
import SiteHeader from "@/components/home/SiteHeader";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <h1 className="sr-only">99BOOKS, 따라 하면 결과물 하나가 나오는 웹 전자책</h1>
        <HeroCarousel items={shelf.filter((item) => item.status === "open")} />
        <BookShelf items={shelf} />
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-8 lg:px-8">
          <span className="type-title text-ink">99BOOKS</span>
          <span className="type-small text-sub">따라 하면 결과물 하나가 나오는 웹 전자책</span>
        </div>
      </footer>
    </div>
  );
}
