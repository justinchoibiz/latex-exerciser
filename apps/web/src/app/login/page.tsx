import { Suspense } from "react";

import { LoginForm, PublicOnlyRoute } from "@/features/auth";

function LoginFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <section className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-neutral-500">Loading login...</p>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <PublicOnlyRoute>
        <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
          <LoginForm />
        </main>
      </PublicOnlyRoute>
    </Suspense>
  );
}