"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import { useAuthStore } from "@/entities/auth";

type PublicOnlyRouteProps = {
  children: React.ReactNode;
};

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

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const hydrate = useAuthStore((state) => state.hydrate);

  const nextPath = useMemo(() => {
    return getSafeNextPath(searchParams.get("next"));
  }, [searchParams]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (token) {
      router.replace(nextPath);
    }
  }, [isHydrated, nextPath, router, token]);

  if (!isHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
        <section className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            Checking session...
          </p>
        </section>
      </main>
    );
  }

  if (token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
        <section className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            Redirecting to app...
          </p>
        </section>
      </main>
    );
  }

  return children;
}