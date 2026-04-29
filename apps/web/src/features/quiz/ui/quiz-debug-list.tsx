"use client";

import { toast } from "sonner";
import { getErrorMessage } from "@/shared/api/error";
import { useEffect, useMemo, useState } from "react";

import type { Quiz } from "@/entities/quiz";
import { listQuizzes } from "@/features/quiz/api/quiz-api";
import { LatexPreview } from "@/shared/ui";

type LoadState = "idle" | "loading" | "success" | "error";

const levelOptions = Array.from({ length: 10 }, (_, index) => index + 1);

function getLevelCounts(quizzes: Quiz[]) {
  return quizzes.reduce<Record<number, number>>((accumulator, quiz) => {
    accumulator[quiz.difficultyLevel] =
      (accumulator[quiz.difficultyLevel] ?? 0) + 1;

    return accumulator;
  }, {});
}

function formatAcceptedVariants(variants: string[]) {
  if (variants.length === 0) {
    return "None";
  }

  return variants.join(", ");
}

export function QuizDebugList() {
  const [selectedLevel, setSelectedLevel] = useState<number | "all">("all");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const levelCounts = useMemo(() => getLevelCounts(quizzes), [quizzes]);

  useEffect(() => {
    async function loadQuizzes() {
      setLoadState("loading");
      setErrorMessage(null);

      try {
        const difficultyLevel =
          selectedLevel === "all" ? undefined : selectedLevel;

        const nextQuizzes = await listQuizzes(difficultyLevel);

        setQuizzes(nextQuizzes);
        setLoadState("success");
      } catch (error) {
        const message = getErrorMessage(error, "Failed to load quizzes.");

        setLoadState("error");
        setErrorMessage(message);
        toast.error(message);
      }
    }

    void loadQuizzes();
  }, [selectedLevel]);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Quiz Database
            </h1>
          </div>

          <label className="block min-w-48">
            <span className="text-sm font-medium text-neutral-800">
              Difficulty filter
            </span>
            <select
              value={selectedLevel}
              onChange={(event) => {
                const value = event.target.value;
                setSelectedLevel(value === "all" ? "all" : Number(value));
              }}
              className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none transition-[border-color,box-shadow] focus:border-neutral-950 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]"
            >
              <option value="all">All levels</option>
              {levelOptions.map((level) => (
                <option key={level} value={level}>
                  Level {level}
                </option>
              ))}
            </select>
          </label>
        </div>

      </div>

      {loadState === "loading" || loadState === "idle" ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-sm text-neutral-600 shadow-sm">
          Loading quizzes...
        </div>
      ) : null}

      {loadState === "error" ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
          <p className="text-sm font-medium text-red-700">Failed to load</p>
          <p className="mt-2 text-sm text-red-700">
            {errorMessage ?? "Failed to load quizzes."}
          </p>
        </div>
      ) : null}

      {loadState === "success" ? (
        <>
          {selectedLevel === "all" ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-neutral-500">
                Level distribution
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {levelOptions.map((level) => (
                  <div
                    key={level}
                    className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                      Level {level}
                    </p>
                    <p className="mt-1 text-xl font-semibold text-neutral-950">
                      {levelCounts[level] ?? 0}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {quizzes.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-sm text-neutral-600 shadow-sm">
              No quizzes found for the selected filter.
            </div>
          ) : (
            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <article
                  key={quiz.id}
                  className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-medium text-white">
                          Level {quiz.difficultyLevel}
                        </span>
                        <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
                          {quiz.timeLimitSec}s
                        </span>
                        <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
                          {quiz.id}
                        </span>
                      </div>

                      <h2 className="mt-4 text-xl font-semibold tracking-tight text-neutral-950">
                        {quiz.promptText}
                      </h2>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                        Target LaTeX
                      </p>
                      <pre className="mt-3 overflow-x-auto rounded-xl bg-neutral-950 px-4 py-3 font-mono text-sm text-white">
                        {quiz.targetLatex}
                      </pre>

                      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-neutral-400">
                        Accepted variants
                      </p>
                      <p className="mt-2 break-words font-mono text-sm text-neutral-700">
                        {formatAcceptedVariants(quiz.acceptedVariants)}
                      </p>
                    </div>

                    <div>
                      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-400">
                        Rendered preview
                      </p>
                      <LatexPreview value={quiz.targetLatex} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}