import { Suspense } from "react";

import { PublicOnlyRoute, SignupForm } from "@/features/auth";

function SignupFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <section className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-neutral-500">
          Loading signup...
        </p>
      </section>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <PublicOnlyRoute>
        <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
          <SignupForm />
        </main>
      </PublicOnlyRoute>
    </Suspense>
  );
}