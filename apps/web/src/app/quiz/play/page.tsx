import { Suspense } from "react";

import { ProtectedRoute } from "@/features/auth";
import { AppShell } from "@/widgets/app-shell";
import { QuizPlayer } from "@/widgets/quiz-player";

function QuizPlayFallback() {
  return (
    <AppShell>
      <ProtectedRoute>
        <div className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-7xl px-6 py-10">
          <section className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-medium text-neutral-500">Quiz</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Loading quiz player...
            </h1>
          </section>
        </div>
      </ProtectedRoute>
    </AppShell>
  );
}

export default function QuizPlayPage() {
  return (
    <Suspense fallback={<QuizPlayFallback />}>
      <AppShell>
        <ProtectedRoute>
          <div className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-7xl px-6 py-10">
            <QuizPlayer />
          </div>
        </ProtectedRoute>
      </AppShell>
    </Suspense>
  );
}