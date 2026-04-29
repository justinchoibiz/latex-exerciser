"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useAuthStore } from "@/entities/auth";
import type { QuizResult } from "@/entities/quiz";
import { getQuizResult } from "@/features/quiz/api/quiz-api";

type LoadState = "idle" | "loading" | "success" | "error";

type QuizResultSummaryProps = {
  sessionId: string;
};

function formatAccuracy(accuracy: number) {
  return `${Math.round(accuracy * 100)}%`;
}

function formatSeconds(value: number) {
  return `${value.toFixed(2)}s`;
}

function formatScore(value: number) {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

function getPerformanceLabel(result: QuizResult) {
  if (result.accuracy >= 0.9) {
    return "Excellent";
  }

  if (result.accuracy >= 0.75) {
    return "Strong";
  }

  if (result.accuracy >= 0.5) {
    return "Developing";
  }

  return "Needs repetition";
}

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
        {value}
      </p>
      {description ? (
        <p className="mt-2 text-sm text-neutral-600">{description}</p>
      ) : null}
    </div>
  );
}

export function QuizResultSummary({ sessionId }: QuizResultSummaryProps) {
  const token = useAuthStore((state) => state.token);
  const hydrate = useAuthStore((state) => state.hydrate);

  const [result, setResult] = useState<QuizResult | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const performanceLabel = useMemo(() => {
    if (!result) {
      return "-";
    }

    return getPerformanceLabel(result);
  }, [result]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    async function loadResult() {
      if (!token) {
        setLoadState("error");
        setErrorMessage("Login is required to view quiz results.");
        return;
      }

      setLoadState("loading");
      setErrorMessage(null);

      try {
        const nextResult = await getQuizResult(token, sessionId);

        setResult(nextResult);
        setLoadState("success");
      } catch (error) {
        setLoadState("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load quiz result.",
        );
      }
    }

    void loadResult();
  }, [sessionId, token]);

  if (loadState === "idle" || loadState === "loading") {
    return (
      <section className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-neutral-500">Quiz Result</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Loading result...
        </h1>
        <p className="mt-3 text-sm text-neutral-600">
          Fetching result metrics from the local FastAPI backend.
        </p>
      </section>
    );
  }

  if (loadState === "error" || !result) {
    return (
      <section className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-neutral-500">Quiz Result</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Result unavailable
        </h1>
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage ?? "Failed to load quiz result."}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/quiz/setup"
            className="rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition-[background-color] hover:bg-neutral-800"
          >
            Restart quiz
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
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">Quiz Result</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              {formatScore(result.totalScore)}
            </h1>
            <p className="mt-3 text-sm text-neutral-600">
              Total score for session{" "}
              <span className="font-medium text-neutral-950">
                {result.sessionId}
              </span>
              .
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Performance
            </p>
            <p className="mt-2 text-xl font-semibold text-neutral-950">
              {performanceLabel}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <MetricCard
            label="Accuracy"
            value={formatAccuracy(result.accuracy)}
            description={`${result.correctCount} correct answers`}
          />
          <MetricCard
            label="Average response"
            value={formatSeconds(result.averageResponseTime)}
            description="Mean time across submitted answers"
          />
          <MetricCard
            label="Best difficulty"
            value={`Level ${result.bestDifficultyCleared}`}
            description="Highest level answered correctly"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Correct"
          value={result.correctCount}
          description="Submitted correct"
        />
        <MetricCard
          label="Wrong"
          value={result.wrongCount}
          description="Submitted wrong"
        />
        <MetricCard
          label="Timeout"
          value={result.timeoutCount}
          description="Timed out before submit"
        />
        <MetricCard
          label="Answer reveal"
          value={result.answerRevealCount}
          description="Used reveal before submit"
        />
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
          <Link
            href="/settings/practice"
            className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-neutral-700 transition-[background-color,color,border-color] hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-950"
          >
            Settings
          </Link>
          <Link
            href="/quiz/setup"
            className="rounded-xl bg-neutral-950 px-4 py-2.5 text-center text-sm font-medium text-white transition-[background-color] hover:bg-neutral-800"
          >
            Restart quiz
          </Link>
        </div>
      </section>
    </div>
  );
}