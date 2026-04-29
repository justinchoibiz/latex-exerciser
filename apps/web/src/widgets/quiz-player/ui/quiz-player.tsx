"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuthStore } from "@/entities/auth";
import type {
  Quiz,
  QuizAnswer,
  QuizSession,
  RevealAnswerResponse,
  SubmitAnswerResponse,
} from "@/entities/quiz";
import {
  getQuizSession,
  nextQuestion,
  QuestionTimer,
  revealAnswer,
  submitAnswer,
} from "@/features/quiz";
import { calculateRemainingTime } from "@/features/quiz/lib/timer";
import { getErrorMessage } from "@/shared/api/error";
import { LatexPreview } from "@/shared/ui";

type LoadState = "idle" | "loading" | "success" | "error";
type ActionState = "idle" | "submitting" | "revealing" | "advancing" | "error";

function getCurrentQuiz(session: QuizSession | null): Quiz | null {
  if (!session) {
    return null;
  }

  return session.quizzes[session.currentIndex] ?? null;
}

function getCurrentAnswer(
  session: QuizSession | null,
  currentQuiz: Quiz | null,
): QuizAnswer | null {
  if (!session || !currentQuiz) {
    return null;
  }

  return (
    session.answers.find((answer) => answer.quizId === currentQuiz.id) ?? null
  );
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

  return Math.round(
    ((session.currentIndex + 1) / session.quizzes.length) * 100,
  );
}

function calculateResponseTimeSec(questionStartedAtMs: number | null) {
  if (questionStartedAtMs === null) {
    return 0;
  }

  return Math.max(
    0,
    Number(((Date.now() - questionStartedAtMs) / 1000).toFixed(2)),
  );
}

function parseIsoToMs(value: string | null | undefined) {
  if (!value) {
    return Date.now();
  }

  const parsed = Date.parse(value);

  if (Number.isNaN(parsed)) {
    return Date.now();
  }

  return parsed;
}

function buildSubmitResultFromAnswer(
  answer: QuizAnswer | null,
  currentQuiz: Quiz | null,
): SubmitAnswerResponse | null {
  if (!answer || !currentQuiz) {
    return null;
  }

  return {
    isCorrect: answer.isCorrect,
    score: answer.score,
    correctLatex: currentQuiz.targetLatex,
    acceptedVariants: currentQuiz.acceptedVariants,
  };
}

export function QuizPlayer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const token = useAuthStore((state) => state.token);
  const hydrate = useAuthStore((state) => state.hydrate);

  const [session, setSession] = useState<QuizSession | null>(null);
  const [latexInput, setLatexInput] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [questionStartedAtMs, setQuestionStartedAtMs] = useState<number | null>(
    null,
  );
  const [remainingSec, setRemainingSec] = useState(0);
  const [isTimedOut, setIsTimedOut] = useState(false);

  const [localSubmitResult, setLocalSubmitResult] =
    useState<SubmitAnswerResponse | null>(null);
  const [revealResult, setRevealResult] = useState<RevealAnswerResponse | null>(
    null,
  );

  const currentQuiz = useMemo(() => getCurrentQuiz(session), [session]);
  const currentQuizId = currentQuiz?.id ?? null;

  const currentAnswer = useMemo(() => {
    return getCurrentAnswer(session, currentQuiz);
  }, [session, currentQuiz]);

  const persistedSubmitResult = useMemo(() => {
    return buildSubmitResultFromAnswer(currentAnswer, currentQuiz);
  }, [currentAnswer, currentQuiz]);

  const submitResult = localSubmitResult ?? persistedSubmitResult;

  const progressLabel = useMemo(() => getProgressLabel(session), [session]);
  const progressPercent = useMemo(() => getProgressPercent(session), [session]);

  const hasSubmitted = Boolean(submitResult);
  const isBusy =
    actionState === "submitting" ||
    actionState === "revealing" ||
    actionState === "advancing";

  const revealedLatex =
    revealResult?.correctLatex ?? submitResult?.correctLatex ?? null;

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
      setActionState("idle");
      setErrorMessage(null);

      try {
        const nextSession = await getQuizSession(token, sessionId);

        setSession(nextSession);
        setLatexInput("");
        setLocalSubmitResult(null);
        setRevealResult(null);
        setLoadState("success");
      } catch (error) {
        const message = getErrorMessage(error, "Failed to load quiz session.");

        setLoadState("error");
        setErrorMessage(message);
        toast.error(message);
      }
    }

    void loadSession();
  }, [sessionId, token]);

  useEffect(() => {
    if (!session || !currentQuiz) {
      return;
    }

    const startedAtMs = parseIsoToMs(session.currentQuestionStartedAt);
    const nextRemainingSec = calculateRemainingTime(
      startedAtMs,
      currentQuiz.timeLimitSec,
      Date.now(),
    );

    setQuestionStartedAtMs(startedAtMs);
    setRemainingSec(nextRemainingSec);
    setIsTimedOut(nextRemainingSec <= 0);
    setLocalSubmitResult(null);
    setRevealResult(null);
    setActionState("idle");
    setErrorMessage(null);
  }, [currentQuizId, session?.currentQuestionStartedAt]);

  useEffect(() => {
    if (
      !currentQuiz ||
      questionStartedAtMs === null ||
      isTimedOut ||
      hasSubmitted
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const nextRemainingSec = calculateRemainingTime(
        questionStartedAtMs,
        currentQuiz.timeLimitSec,
        Date.now(),
      );

      setRemainingSec(nextRemainingSec);

      if (nextRemainingSec <= 0) {
        setIsTimedOut(true);
        window.clearInterval(intervalId);
      }
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [currentQuiz, hasSubmitted, isTimedOut, questionStartedAtMs]);

  async function reloadSession() {
    if (!token || !sessionId) {
      return null;
    }

    const nextSession = await getQuizSession(token, sessionId);
    setSession(nextSession);

    return nextSession;
  }

  async function handleSubmitAnswer() {
    if (!token || !sessionId || !currentQuiz) {
      return;
    }

    if (isTimedOut) {
      const message = "Cannot submit after timeout.";

      setActionState("error");
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    if (hasSubmitted) {
      const message = "Current question has already been submitted.";

      setActionState("error");
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    setActionState("submitting");
    setErrorMessage(null);

    try {
      const response = await submitAnswer(token, sessionId, {
        quizId: currentQuiz.id,
        submittedLatex: latexInput,
        responseTimeSec: calculateResponseTimeSec(questionStartedAtMs),
        timedOut: false,
      });

      setLocalSubmitResult(response);
      setRevealResult({
        correctLatex: response.correctLatex,
        acceptedVariants: response.acceptedVariants,
      });

      if (response.isCorrect) {
        toast.success("Correct answer.");
      } else {
        toast.error("Wrong answer.");
      }

      setActionState("idle");

      await reloadSession();
    } catch (error) {
      const message = getErrorMessage(error, "Failed to submit answer.");

      setActionState("error");
      setErrorMessage(message);
      toast.error(message);
    }
  }

  async function handleRevealAnswer() {
    if (!token || !sessionId || !currentQuiz) {
      return;
    }

    if (revealResult) {
      return;
    }

    setActionState("revealing");
    setErrorMessage(null);

    try {
      const response = await revealAnswer(token, sessionId, {
        quizId: currentQuiz.id,
      });

      setRevealResult(response);
      setActionState("idle");
      toast.success("Answer revealed.");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to reveal answer.");

      setActionState("error");
      setErrorMessage(message);
      toast.error(message);
    }
  }

  async function handleNextQuestion() {
    if (!token || !sessionId) {
      return;
    }

    setActionState("advancing");
    setErrorMessage(null);

    try {
      const response = await nextQuestion(token, sessionId);

      if (response.status === "completed") {
        toast.success("Quiz completed.");
        router.push(`/quiz/result/${response.sessionId}`);
        return;
      }

      const nextSession = await getQuizSession(token, sessionId);
      const nextQuiz = nextSession.quizzes[nextSession.currentIndex] ?? null;
      const nextStartedAtMs = parseIsoToMs(
        nextSession.currentQuestionStartedAt,
      );

      setSession(nextSession);
      setLatexInput("");
      setLocalSubmitResult(null);
      setRevealResult(null);
      setIsTimedOut(false);
      setRemainingSec(
        nextQuiz
          ? calculateRemainingTime(
              nextStartedAtMs,
              nextQuiz.timeLimitSec,
              Date.now(),
            )
          : 0,
      );
      setQuestionStartedAtMs(nextStartedAtMs);
      setActionState("idle");
      toast.success("Moved to next question.");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to move next.");

      setActionState("error");
      setErrorMessage(message);
      toast.error(message);
    }
  }

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
            </div>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-neutral-950 transition-[width]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-neutral-950">
            [Level {currentQuiz.difficultyLevel}] {currentQuiz.promptText}
          </h2>
        </div>

        <QuestionTimer
          remainingSec={remainingSec}
          timeLimitSec={currentQuiz.timeLimitSec}
        />

        {submitResult ? (
          <div
            className={
              submitResult.isCorrect
                ? "rounded-2xl border border-green-200 bg-green-50 p-6"
                : "rounded-2xl border border-red-200 bg-red-50 p-6"
            }
          >
            <p
              className={
                submitResult.isCorrect
                  ? "text-sm font-medium text-green-700"
                  : "text-sm font-medium text-red-700"
              }
            >
              {submitResult.isCorrect ? "Correct" : "Wrong"}
            </p>
            <h2
              className={
                submitResult.isCorrect
                  ? "mt-2 text-xl font-semibold tracking-tight text-green-950"
                  : "mt-2 text-xl font-semibold tracking-tight text-red-950"
              }
            >
              Score: {submitResult.score}
            </h2>
            <p
              className={
                submitResult.isCorrect
                  ? "mt-3 text-sm text-green-700"
                  : "mt-3 text-sm text-red-700"
              }
            >
              Correct answer is now visible. Move to the next question when
              ready.
            </p>
          </div>
        ) : null}

        {errorMessage ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <label className="block">
            <textarea
              value={latexInput}
              onChange={(event) => setLatexInput(event.target.value)}
              rows={10}
              autoFocus
              disabled={hasSubmitted || isTimedOut}
              className="mt-3 w-full resize-none rounded-2xl border border-neutral-300 bg-white px-4 py-3 font-mono text-sm text-neutral-950 outline-none transition-[border-color,box-shadow,opacity] placeholder:text-neutral-400 focus:border-neutral-950 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)] disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-70"
              placeholder="Type LaTeX here, e.g. x^2"
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLatexInput(currentQuiz.targetLatex)}
              disabled={hasSubmitted || isTimedOut}
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-[background-color,color,border-color,opacity] hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Fill target for preview test
            </button>
            <button
              type="button"
              onClick={() => setLatexInput("")}
              disabled={hasSubmitted || isTimedOut}
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-[background-color,color,border-color,opacity] hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={isBusy || hasSubmitted || isTimedOut}
              className="rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition-[background-color,opacity] hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionState === "submitting" ? "Submitting..." : "Submit answer"}
            </button>

            <button
              type="button"
              onClick={handleRevealAnswer}
              disabled={isBusy || Boolean(revealResult)}
              className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-[background-color,color,border-color,opacity] hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionState === "revealing" ? "Revealing..." : "Show answer"}
            </button>

            <button
              type="button"
              onClick={handleNextQuestion}
              disabled={isBusy}
              className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-[background-color,color,border-color,opacity] hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionState === "advancing"
                ? "Loading next..."
                : "Next question"}
            </button>
          </div>
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
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Answer
          </h2>

          {revealedLatex ? (
            <pre className="mt-5 overflow-x-auto rounded-2xl bg-neutral-950 px-4 py-3 text-sm text-white">
              {revealedLatex}
            </pre>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-500">
              Answer hidden.
            </div>
          )}

          {revealResult?.acceptedVariants.length ? (
            <div className="mt-5">
              <p className="text-sm font-medium text-neutral-800">
                Accepted variants
              </p>
              <ul className="mt-2 space-y-2">
                {revealResult.acceptedVariants.map((variant) => (
                  <li
                    key={variant}
                    className="rounded-xl bg-neutral-50 px-3 py-2 font-mono text-sm text-neutral-700"
                  >
                    {variant}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
