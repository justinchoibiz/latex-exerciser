"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import { useAuthStore } from "@/entities/auth";
import { createQuizSession } from "@/features/quiz/api/quiz-api";
import { getSettings } from "@/features/settings/api/settings-api";

const levelOptions = Array.from({ length: 10 }, (_, index) => index + 1);

type SubmitState = "idle" | "submitting" | "error";

type QuizSetupFormValue = {
  levelMin: number;
  levelMax: number;
};

const defaultFormValue: QuizSetupFormValue = {
  levelMin: 1,
  levelMax: 3,
};

export function QuizSetupForm() {
  const router = useRouter();

  const token = useAuthStore((state) => state.token);
  const hydrate = useAuthStore((state) => state.hydrate);

  const [formValue, setFormValue] =
    useState<QuizSetupFormValue>(defaultFormValue);
  const [isLoadingDefaults, setIsLoadingDefaults] = useState(true);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedLevelCount = useMemo(() => {
    return formValue.levelMax - formValue.levelMin + 1;
  }, [formValue.levelMax, formValue.levelMin]);

  const generatedQuizCount = useMemo(() => {
    if (selectedLevelCount < 1) {
      return 0;
    }

    return selectedLevelCount * 10;
  }, [selectedLevelCount]);

  const estimatedMinutes = useMemo(() => {
    const roughSecondsPerQuestion = 45;
    const totalSeconds = generatedQuizCount * roughSecondsPerQuestion;

    return Math.max(1, Math.round(totalSeconds / 60));
  }, [generatedQuizCount]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    async function loadDefaults() {
      if (!token) {
        setIsLoadingDefaults(false);
        return;
      }

      setIsLoadingDefaults(true);
      setErrorMessage(null);

      try {
        const settings = await getSettings(token);

        setFormValue({
          levelMin: settings.defaultLevelMin,
          levelMax: settings.defaultLevelMax,
        });
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load quiz defaults.",
        );
      } finally {
        setIsLoadingDefaults(false);
      }
    }

    void loadDefaults();
  }, [token]);

  function updateField<TField extends keyof QuizSetupFormValue>(
    field: TField,
    value: QuizSetupFormValue[TField],
  ) {
    setSubmitState("idle");
    setErrorMessage(null);

    setFormValue((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setSubmitState("error");
      setErrorMessage("Login is required to start a quiz session.");
      return;
    }

    if (formValue.levelMin > formValue.levelMax) {
      setSubmitState("error");
      setErrorMessage("Start level must be less than or equal to end level.");
      return;
    }

    setSubmitState("submitting");
    setErrorMessage(null);

    try {
      const response = await createQuizSession(token, {
        levelMin: formValue.levelMin,
        levelMax: formValue.levelMax,
      });

      router.push(`/quiz/play?sessionId=${response.sessionId}`);
    } catch (error) {
      setSubmitState("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to create quiz session.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"
    >
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-neutral-500">Quiz</p>
        <h1 className="text-3xl font-semibold tracking-tight">Quiz Setup</h1>
        <p className="text-sm text-neutral-600">
          Select a difficulty range. The number of questions is generated from
          the selected levels.
        </p>
      </div>

      {!token ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Login is required to create a quiz session.
        </div>
      ) : null}

      {isLoadingDefaults ? (
        <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-600">
          Loading quiz defaults...
        </div>
      ) : (
        <div className="mt-8 grid gap-6">
          <div className="grid gap-4 rounded-2xl border border-neutral-200 p-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-neutral-800">
                Start level
              </span>
              <select
                value={formValue.levelMin}
                onChange={(event) =>
                  updateField("levelMin", Number(event.target.value))
                }
                className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] focus:border-neutral-950 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]"
              >
                {levelOptions.map((level) => (
                  <option key={level} value={level}>
                    Level {level}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-800">
                End level
              </span>
              <select
                value={formValue.levelMax}
                onChange={(event) =>
                  updateField("levelMax", Number(event.target.value))
                }
                className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] focus:border-neutral-950 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]"
              >
                {levelOptions.map((level) => (
                  <option key={level} value={level}>
                    Level {level}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Selected levels
              </p>
              <p className="mt-2 text-2xl font-semibold text-neutral-950">
                {selectedLevelCount > 0 ? selectedLevelCount : 0}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Generated quizzes
              </p>
              <p className="mt-2 text-2xl font-semibold text-neutral-950">
                {generatedQuizCount}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Estimated time
              </p>
              <p className="mt-2 text-2xl font-semibold text-neutral-950">
                {estimatedMinutes}m
              </p>
            </div>
          </section>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            <p className="text-sm font-medium text-neutral-800">
              Quiz count rule
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              totalQuizCount = selectedLevelCount × 10. Manual quiz count
              override is not supported in v0.
            </p>
          </div>
        </div>
      )}

      {errorMessage ? (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={
            isLoadingDefaults ||
            submitState === "submitting" ||
            !token ||
            formValue.levelMin > formValue.levelMax
          }
          className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition-[background-color,opacity] hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitState === "submitting" ? "Creating session..." : "Start quiz"}
        </button>
      </div>
    </form>
  );
}