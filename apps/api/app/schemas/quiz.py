from pydantic import BaseModel, Field, model_validator


class OkResponse(BaseModel):
    ok: bool


class QuizResponse(BaseModel):
    id: str
    difficultyLevel: int = Field(ge=1, le=10)
    promptText: str = Field(min_length=1)
    targetLatex: str = Field(min_length=1)
    acceptedVariants: list[str] = Field(default_factory=list)
    timeLimitSec: int = Field(ge=5, le=300)


class CreateQuizRequest(BaseModel):
    difficultyLevel: int = Field(ge=1, le=10)
    promptText: str = Field(min_length=1)
    targetLatex: str = Field(min_length=1)
    acceptedVariants: list[str] = Field(default_factory=list)
    timeLimitSec: int = Field(ge=5, le=300)


class PatchQuizRequest(BaseModel):
    difficultyLevel: int | None = Field(default=None, ge=1, le=10)
    promptText: str | None = Field(default=None, min_length=1)
    targetLatex: str | None = Field(default=None, min_length=1)
    acceptedVariants: list[str] | None = None
    timeLimitSec: int | None = Field(default=None, ge=5, le=300)

    @model_validator(mode="after")
    def validate_patch(self) -> "PatchQuizRequest":
        has_at_least_one_field = any(
            value is not None for value in self.model_dump().values()
        )

        if not has_at_least_one_field:
            raise ValueError("At least one quiz field must be provided.")

        return self


class CreateQuizSessionRequest(BaseModel):
    levelMin: int = Field(ge=1, le=10)
    levelMax: int = Field(ge=1, le=10)

    @model_validator(mode="after")
    def validate_level_range(self) -> "CreateQuizSessionRequest":
        if self.levelMin > self.levelMax:
            raise ValueError("levelMin must be less than or equal to levelMax.")
        return self


class CreateQuizSessionResponse(BaseModel):
    sessionId: str


class SubmitAnswerRequest(BaseModel):
    quizId: str
    submittedLatex: str
    responseTimeSec: float = Field(ge=0)
    timedOut: bool = False


class SubmitAnswerResponse(BaseModel):
    isCorrect: bool
    score: float
    correctLatex: str
    acceptedVariants: list[str]


class RevealAnswerRequest(BaseModel):
    quizId: str


class RevealAnswerResponse(BaseModel):
    correctLatex: str
    acceptedVariants: list[str]


class NextQuestionResponse(BaseModel):
    sessionId: str
    currentIndex: int = Field(ge=0)
    status: str


class QuizAnswerResponse(BaseModel):
    quizId: str
    submittedLatex: str
    isCorrect: bool
    usedReveal: bool
    timedOut: bool
    responseTimeSec: float = Field(ge=0)
    score: float = Field(ge=0)


class QuizSessionResponse(BaseModel):
    id: str
    userId: str
    levelMin: int = Field(ge=1, le=10)
    levelMax: int = Field(ge=1, le=10)
    quizzes: list[QuizResponse]
    currentIndex: int = Field(ge=0)
    answers: list[QuizAnswerResponse]
    status: str
    startedAt: str
    currentQuestionStartedAt: str
    completedAt: str | None = None

    @model_validator(mode="after")
    def validate_level_range(self) -> "QuizSessionResponse":
        if self.levelMin > self.levelMax:
            raise ValueError("levelMin must be less than or equal to levelMax.")
        return self


class QuizResultResponse(BaseModel):
    sessionId: str
    totalScore: float = Field(ge=0)
    accuracy: float = Field(ge=0, le=1)
    averageResponseTime: float = Field(ge=0)
    correctCount: int = Field(ge=0)
    wrongCount: int = Field(ge=0)
    timeoutCount: int = Field(ge=0)
    answerRevealCount: int = Field(ge=0)
    bestDifficultyCleared: int = Field(ge=0, le=10)