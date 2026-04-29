import type {
  CreateQuizSessionRequest,
  CreateQuizSessionResponse,
  QuizSession,
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