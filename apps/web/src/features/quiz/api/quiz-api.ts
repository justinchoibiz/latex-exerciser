import type {
  CreateQuizSessionRequest,
  CreateQuizSessionResponse,
  NextQuestionResponse,
  QuizResult,
  QuizSession,
  RevealAnswerRequest,
  RevealAnswerResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
} from "@/entities/quiz";
import { apiClient } from "@/shared/api/client";

export function createQuizSession(
  token: string,
  payload: CreateQuizSessionRequest,
) {
  return apiClient<CreateQuizSessionResponse, CreateQuizSessionRequest>(
    "/quiz/sessions",
    {
      method: "POST",
      token,
      body: payload,
    },
  );
}

export function getQuizSession(token: string, sessionId: string) {
  return apiClient<QuizSession>(`/quiz/sessions/${sessionId}`, {
    method: "GET",
    token,
  });
}

export function submitAnswer(
  token: string,
  sessionId: string,
  payload: SubmitAnswerRequest,
) {
  return apiClient<SubmitAnswerResponse, SubmitAnswerRequest>(
    `/quiz/sessions/${sessionId}/submit`,
    {
      method: "POST",
      token,
      body: payload,
    },
  );
}

export function revealAnswer(
  token: string,
  sessionId: string,
  payload: RevealAnswerRequest,
) {
  return apiClient<RevealAnswerResponse, RevealAnswerRequest>(
    `/quiz/sessions/${sessionId}/reveal`,
    {
      method: "POST",
      token,
      body: payload,
    },
  );
}

export function nextQuestion(token: string, sessionId: string) {
  return apiClient<NextQuestionResponse, Record<string, never>>(
    `/quiz/sessions/${sessionId}/next`,
    {
      method: "POST",
      token,
      body: {},
    },
  );
}

export function getQuizResult(token: string, sessionId: string) {
  return apiClient<QuizResult>(`/quiz/sessions/${sessionId}/result`, {
    method: "GET",
    token,
  });
}