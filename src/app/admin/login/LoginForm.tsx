"use client";

import { useActionState } from "react";
import { login, type LoginState } from "../actions";

const initial: LoginState = { error: null };

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, initial);
  return (
    <form action={action} className="mt-8 flex flex-col gap-3">
      <label htmlFor="admin-password" className="type-label text-ink">
        관리자 비밀번호
      </label>
      <input
        id="admin-password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        aria-describedby={state.error ? "admin-login-error" : undefined}
        className="type-body min-h-12 rounded-xl border border-line bg-white px-4 text-ink focus:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
      />
      {state.error && (
        <p id="admin-login-error" role="alert" className="type-small text-brand-ink">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="type-label mt-2 min-h-12 rounded-full bg-header px-6 text-white transition-opacity disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        {pending ? "확인하는 중" : "로그인"}
      </button>
    </form>
  );
}
