"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "@/entities/auth";

export function HomeRedirectPage() {
  const router = useRouter();

  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (token) {
      router.replace("/quiz/setup");
      return;
    }

    router.replace("/login");
  }, [isHydrated, router, token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-neutral-500">
          Loading LaTeX Exerciser...
        </p>
      </section>
    </main>
  );
}