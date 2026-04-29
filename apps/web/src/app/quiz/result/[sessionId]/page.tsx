import { ProtectedRoute } from "@/features/auth";
import { QuizResultSummary } from "@/features/quiz";
import { AppShell } from "@/widgets/app-shell";

type QuizResultPageProps = {
  params: Promise<{
    sessionId: string;
  }>;
};

export default async function QuizResultPage({ params }: QuizResultPageProps) {
  const { sessionId } = await params;

  return (
    <AppShell>
      <ProtectedRoute>
        <div className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-6xl px-6 py-10">
          <QuizResultSummary sessionId={sessionId} />
        </div>
      </ProtectedRoute>
    </AppShell>
  );
}