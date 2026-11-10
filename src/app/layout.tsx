import type { Metadata, Viewport } from "next";
import { Black_Han_Sans } from "next/font/google";
import "./globals.css";

// 제목 폰트: Black Han Sans (OFL, 상업 이용 가능)
const blackhan = Black_Han_Sans({ weight: "400", variable: "--font-blackhan", preload: false, display: "swap" });

export const metadata: Metadata = {
  title: "99BOOKS",
  description: "990원으로 스킬 하나를 익히는 웹 전자책",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${blackhan.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
