// 관리자 로그인. 서버에서만 쓴다(비밀번호와 서명 키를 다룬다).
// 2026-11-16 결정: 회원 로그인이 붙기 전까지는 관리자 비밀번호 하나로 들어온다.
// 비밀번호 값은 사용자가 .env.local의 ADMIN_PASSWORD에 직접 넣는다(코드와 대화에 적지 않는다).
// 로그인하면 "만료 시각.서명" 모양의 쿠키를 준다. 서명 키는 비밀번호에서 만들므로,
// 비밀번호를 바꾸면 이미 준 쿠키는 모두 무효가 된다.
// 회원 로그인(Supabase)이 붙으면 isAdmin 안쪽만 "로그인한 이메일이 관리자 목록에 있는가"로 바꾼다.

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

export const ADMIN_COOKIE = "99b_admin";
/** 로그인 유지 시간(초): 12시간 */
export const ADMIN_MAX_AGE = 60 * 60 * 12;

function adminPassword(): string | null {
  const p = process.env.ADMIN_PASSWORD ?? "";
  return p.length > 0 ? p : null;
}

/** 비밀번호가 설정되지 않았으면 관리자 로그인 자체를 끈다 */
export function adminEnabled(): boolean {
  return adminPassword() !== null;
}

function signingKey(password: string): Buffer {
  return createHmac("sha256", "99books-admin-session").update(password).digest();
}

function sign(payload: string, password: string): string {
  return createHmac("sha256", signingKey(password)).update(payload).digest("base64url");
}

/** 길이가 달라도 시간 차이로 정보가 새지 않게 해시끼리 비교한다 */
function sameText(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(input: string): boolean {
  const password = adminPassword();
  if (!password) return false;
  return sameText(input, password);
}

export function makeToken(now = Date.now()): string | null {
  const password = adminPassword();
  if (!password) return null;
  const payload = String(now + ADMIN_MAX_AGE * 1000);
  return `${payload}.${sign(payload, password)}`;
}

export function checkToken(token: string, now = Date.now()): boolean {
  const password = adminPassword();
  if (!password) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expires = Number(payload);
  if (!Number.isFinite(expires) || expires <= now) return false;
  return sameText(signature, sign(payload, password));
}

/** 지금 요청이 관리자 것인가. 요청마다 쿠키를 읽으므로 Suspense 안에서 부른다 */
export async function isAdmin(): Promise<boolean> {
  // 만료 확인에 현재 시각을 쓰므로, 미리 그려 두지 말고 요청 때 계산하게 한다
  await connection();
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return Boolean(token && checkToken(token));
}
