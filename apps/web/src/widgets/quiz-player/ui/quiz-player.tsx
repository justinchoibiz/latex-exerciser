"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useAuthStore } from "@/entities/auth";
import type { Quiz, QuizSession } from "@/entities/quiz";
import { getQuizSession } from "@/features/quiz";
import { LatexPreview } from "@/shared/ui";

type LoadState = "idle" | "loading" | "success" | "error";

function getCurrentQuiz(session: QuizSession | null): Quiz | null {
  if (!session) {
    return null;
  }

  return session.quizzes[session.currentIndex] ?? null;
}

function getProgressLabel(session: QuizSession | null) {
  if (!session) {
    return "Question - / -";
  }

  return `Question ${session.currentIndex + 1} / ${session.quizzes.length}`;
}

function getProgressPercent(session: QuizSession | null) {
  if (!session || session.quizzes.length === 0) {
    return 0;
  }

  return Math.round(((session.currentIndex + 1) / session.quizzes.length) * 100);
}

export function QuizPlayer() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const token = useAuthStore((state) => state.token);
  const hydrate = useAuthStore((state) => state.hydrate);

  const [session, setSession] = useState<QuizSession | null>(null);
  const [latexInput, setLatexInput] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentQuiz = useMemo(() => getCurrentQuiz(session), [session]);
  const progressLabel = useMemo(() => getProgressLabel(session), [session]);
  const progressPercent = useMemo(() => getProgressPercent(session), [session]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    async function loadSession() {
      if (!sessionId) {
        setLoadState("error");
        setErrorMessage("Missing sessionId. Start a quiz from the setup page.");
        return;
      }

      if (!token) {
        setLoadState("error");
        setErrorMessage("Login is required to play a quiz session.");
        return;
      }

      setLoadState("loading");
      setErrorMessage(null);

      try {
        const nextSession = await getQuizSession(token, sessionId);

        setSession(nextSession);
        setLatexInput("");
        setLoadState("success");
      } catch (error) {
        setLoadState("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load quiz session.",
        );
      }
    }

    void loadSession();
  }, [sessionId, token]);

  if (loadState === "loading" || loadState === "idle") {
    return (
      <section className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-neutral-500">Quiz</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Loading quiz session...
        </h1>
        <p className="mt-3 text-sm text-neutral-600">
          Fetching session data from the local FastAPI backend.
        </p>
      </section>
    );
  }

  if (loadState === "error" || !session || !currentQuiz) {
    return (
      <section className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-neutral-500">Quiz</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Quiz session unavailable
        </h1>
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage ?? "Failed to load quiz session."}
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            href="/quiz/setup"
            className="rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition-[background-color] hover:bg-neutral-800"
          >
            Go to setup
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-[background-color,color,border-color] hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-950"
          >
            Login
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section className="space-y-6">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                {progressLabel}
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Level {currentQuiz.difficultyLevel}
              </h1>
              <p className="mt-3 text-sm text-neutral-600">
                Type the LaTeX expression that matches the prompt.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              <p className="font-medium text-neutral-950">
                {currentQuiz.timeLimitSec}s
              </p>
              <p className="text-xs text-neutral-500">time limit</p>
            </div>
          </div>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-neutral-950 transition-[width]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Prompt</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950">
            {currentQuiz.promptText}
          </h2>

          <div className="mt-5 grid gap-3 text-sm text-neutral-600">
            <div className="rounded-xl bg-neutral-50 px-4 py-3">
              <span className="font-medium text-neutral-800">Quiz ID:</span>{" "}
              {currentQuiz.id}
            </div>
            <div className="rounded-xl bg-neutral-50 px-4 py-3">
              <span className="font-medium text-neutral-800">Session ID:</span>{" "}
              {session.id}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <label className="block">
            <span className="text-sm font-medium text-neutral-800">
              LaTeX input
            </span>
            <textarea
              value={latexInput}
              onChange={(event) => setLatexInput(event.target.value)}
              rows={10}
              autoFocus
              className="mt-3 w-full resize-none rounded-2xl border border-neutral-300 bg-white px-4 py-3 font-mono text-sm text-neutral-950 outline-none transition-[border-color,box-shadow] placeholder:text-neutral-400 focus:border-neutral-950 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]"
              placeholder="Type LaTeX here, e.g. x^2"
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLatexInput(currentQuiz.targetLatex)}
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-[background-color,color,border-color] hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-950"
            >
              Fill target for preview test
            </button>
            <button
              type="button"
              onClick={() => setLatexInput("")}
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-[background-color,color,border-color] hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-950"
            >
              Clear
            </button>
          </div>

          <p className="mt-4 text-xs text-neutral-500">
            Submit/reveal/next actions will be implemented in Step 17.
          </p>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Live Preview</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Rendered Output
          </h2>
          <p className="mt-3 text-sm text-neutral-600">
            Preview updates as the input changes.
          </p>

          <div className="mt-6">
            <LatexPreview value={latexInput} />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Reference</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Current Target
          </h2>
          <p className="mt-3 text-sm text-neutral-600">
            This is visible in v1 for development verification. It will be moved
            behind reveal behavior in later steps.
          </p>

          <pre className="mt-5 overflow-x-auto rounded-2xl bg-neutral-950 px-4 py-3 text-sm text-white">
            {currentQuiz.targetLatex}
          </pre>

          {currentQuiz.acceptedVariants.length > 0 ? (
            <div className="mt-5">
              <p className="text-sm font-medium text-neutral-800">
                Accepted variants
              </p>
              <ul className="mt-2 space-y-2">
                {currentQuiz.acceptedVariants.map((variant) => (
                  <li
                    key={variant}
                    className="rounded-xl bg-neutral-50 px-3 py-2 font-mono text-sm text-neutral-700"
                  >
                    {variant}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-5 rounded-xl bg-neutral-50 px-3 py-2 text-sm text-neutral-500">
              No accepted variants.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}