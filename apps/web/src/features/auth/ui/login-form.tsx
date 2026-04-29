"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuthStore } from "@/entities/auth";
import { login } from "@/features/auth/api/auth-api";
import { getErrorMessage } from "@/shared/api/error";

function getSafeNextPath(next: string | null) {
  if (!next) {
    return "/quiz/setup";
  }

  if (!next.startsWith("/") || next.startsWith("//")) {
    return "/quiz/setup";
  }

  if (next === "/login" || next === "/signup") {
    return "/quiz/setup";
  }

  return next;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  const nextPath = useMemo(() => {
    return getSafeNextPath(searchParams.get("next"));
  }, [searchParams]);

  const [email, setEmail] = useState("session@example.com");
  const [password, setPassword] = useState("password123");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const auth = await login({
        email,
        password,
      });

      setAuth(auth);
      toast.success("Logged in.");
      router.push(nextPath);
    } catch (error) {
      const message = getErrorMessage(error, "Failed to login.");

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"
    >
      <div>
        <p className="text-sm font-medium text-neutral-500">Auth</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Login</h1>
        <p className="mt-3 text-sm text-neutral-600">
          Login with your mock account to start practicing LaTeX.
        </p>
      </div>

      <div className="mt-8 space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-neutral-800">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none transition-[border-color,box-shadow] placeholder:text-neutral-400 focus:border-neutral-950 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]"
            placeholder="user@example.com"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-neutral-800">Password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none transition-[border-color,box-shadow] placeholder:text-neutral-400 focus:border-neutral-950 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]"
            placeholder="password123"
          />
        </label>
      </div>

      {errorMessage ? (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 w-full rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition-[background-color,opacity] hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </button>

      <p className="mt-5 text-center text-sm text-neutral-600">
        No account?{" "}
        <Link
          href={`/signup?next=${encodeURIComponent(nextPath)}`}
          className="font-medium text-neutral-950 underline underline-offset-4"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}