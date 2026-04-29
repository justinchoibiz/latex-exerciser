import { QuizSetupForm } from "@/features/quiz";
import { AppShell } from "@/widgets/app-shell";

export default function QuizSetupPage() {
  return (
    <AppShell>
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center px-6 py-10">
        <QuizSetupForm />
      </div>
    </AppShell>
  );
}