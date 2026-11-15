"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, ADMIN_MAX_AGE, adminEnabled, checkPassword, makeToken } from "@/lib/admin-auth";

export type LoginState = { error: string | null };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 관리자 로그인. 맞으면 쿠키를 주고 대시보드로, 틀리면 1초 기다린 뒤 안내 문구를 돌려준다 */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!adminEnabled()) return { error: "관리자 비밀번호가 아직 설정되지 않았어요." };

  const input = String(formData.get("password") ?? "");
  if (!checkPassword(input)) {
    // 비밀번호를 연달아 넣어 맞히는 시도를 느리게 만든다
    await wait(1000);
    return { error: "비밀번호가 맞지 않아요." };
  }

  const token = makeToken();
  if (!token) return { error: "관리자 비밀번호가 아직 설정되지 않았어요." };

  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: ADMIN_MAX_AGE,
  });
  redirect("/admin");
}

export async function logout(): Promise<void> {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: "/admin" });
  redirect("/admin/login");
}
