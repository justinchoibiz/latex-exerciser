import { AppShell } from "@/widgets/app-shell";

export default function QuizSetupPage() {
  return (
    <AppShell>
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center px-6 py-10">
        <section className="w-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Quiz</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Quiz Setup
          </h1>
          <p className="mt-3 text-sm text-neutral-600">
            Difficulty range setup will be implemented in Step 13.
          </p>
        </section>
      </div>
    </AppShell>
  );
}