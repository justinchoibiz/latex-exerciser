"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import { useAuthStore } from "@/entities/auth";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

function buildNextPath(pathname: string, searchParams: URLSearchParams) {
  const query = searchParams.toString();

  if (!query) {
    return pathname;
  }

  return `${pathname}?${query}`;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const hydrate = useAuthStore((state) => state.hydrate);

  const nextPath = useMemo(() => {
    return buildNextPath(pathname, searchParams);
  }, [pathname, searchParams]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
    }
  }, [isHydrated, nextPath, router, token]);

  if (!isHydrated) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6">
        <section className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            Checking session...
          </p>
        </section>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6">
        <section className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            Redirecting to login...
          </p>
        </section>
      </main>
    );
  }

  return children;
}