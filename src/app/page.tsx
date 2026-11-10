import { shelf } from "@/books";
import BookShelf from "@/components/home/BookShelf";
import HeroCarousel from "@/components/home/HeroCarousel";
import SiteHeader from "@/components/home/SiteHeader";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <h1 className="sr-only">99BOOKS, 990원으로 스킬 하나를 익히는 웹 전자책</h1>
        <HeroCarousel items={shelf} />
        <BookShelf items={shelf} />
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-8 text-sm text-sub lg:px-8">
          <span className="font-title text-lg text-ink">99BOOKS</span>
          <span>모든 책 990원, 결제 후 계속 볼 수 있어요</span>
        </div>
      </footer>
    </div>
  );
}
