import type { Metadata } from "next";
import { adminEnabled } from "@/lib/admin-auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "관리자 로그인 | 99BOOKS",
  robots: { index: false, follow: false },
};

/** 관리자 로그인(와이어프레임 3-11). 사이트 메뉴에는 넣지 않는다 */
export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-panel px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-8">
        <p className="type-title text-ink">99BOOKS 관리자</p>
        {adminEnabled() ? (
          <LoginForm />
        ) : (
          <p className="type-small mt-6 text-sub">
            관리자 비밀번호가 아직 설정되지 않아 로그인할 수 없어요. 프로젝트 폴더의 .env.local 파일에서 ADMIN_PASSWORD 값을
            채운 뒤 개발 서버를 다시 켜 주세요.
          </p>
        )}
      </div>
    </main>
  );
}
