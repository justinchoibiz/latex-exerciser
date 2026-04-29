export type Quiz = {
  id: string;
  difficultyLevel: number;
  promptText: string;
  targetLatex: string;
  acceptedVariants: string[];
  timeLimitSec: number;
};

export type QuizAnswer = {
  quizId: string;
  submittedLatex: string;
  isCorrect: boolean;
  usedReveal: boolean;
  timedOut: boolean;
  responseTimeSec: number;
  score: number;
};

export type QuizSessionStatus = "playing" | "completed";

export type QuizSession = {
  id: string;
  userId: string;
  levelMin: number;
  levelMax: number;
  quizzes: Quiz[];
  currentIndex: number;
  answers: QuizAnswer[];
  status: QuizSessionStatus;
  startedAt: string;
  completedAt: string | null;
};

export type CreateQuizSessionRequest = {
  levelMin: number;
  levelMax: number;
};

export type CreateQuizSessionResponse = {
  sessionId: string;
};

export type QuizResult = {
  sessionId: string;
  totalScore: number;
  accuracy: number;
  averageResponseTime: number;
  correctCount: number;
  wrongCount: number;
  timeoutCount: number;
  answerRevealCount: number;
  bestDifficultyCleared: number;
};