import { QuizDebugList } from "@/features/quiz";
import { AppShell } from "@/widgets/app-shell";

export default function QuizzesPage() {
  return (
    <AppShell>
      <div className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-7xl px-6 py-10">
        <QuizDebugList />
      </div>
    </AppShell>
  );
}