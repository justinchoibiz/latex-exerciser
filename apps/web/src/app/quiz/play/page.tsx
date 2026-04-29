import { AppShell } from "@/widgets/app-shell";
import { QuizPlayer } from "@/widgets/quiz-player";

export default function QuizPlayPage() {
  return (
    <AppShell>
      <div className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-7xl px-6 py-10">
        <QuizPlayer />
      </div>
    </AppShell>
  );
}