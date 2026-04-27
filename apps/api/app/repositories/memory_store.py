from copy import deepcopy
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any


DEFAULT_USER_SETTINGS: dict[str, Any] = {
    "defaultLevelMin": 1,
    "defaultLevelMax": 3,
    "defaultTimeLimit": 60,
    "strictMode": False,
    "autoAdvanceAfterAnswer": False,
}


SEED_QUIZZES: list[dict[str, Any]] = [
    # Level 1
    {
        "id": "quiz_1_1",
        "difficultyLevel": 1,
        "promptText": "x squared",
        "targetLatex": "x^2",
        "acceptedVariants": ["x^{2}"],
        "timeLimitSec": 30,
    },
    {
        "id": "quiz_1_2",
        "difficultyLevel": 1,
        "promptText": "a over b",
        "targetLatex": "\\frac{a}{b}",
        "acceptedVariants": [],
        "timeLimitSec": 30,
    },
    {
        "id": "quiz_1_3",
        "difficultyLevel": 1,
        "promptText": "square root of x",
        "targetLatex": "\\sqrt{x}",
        "acceptedVariants": [],
        "timeLimitSec": 30,
    },
    {
        "id": "quiz_1_4",
        "difficultyLevel": 1,
        "promptText": "a subscript b",
        "targetLatex": "a_b",
        "acceptedVariants": ["a_{b}"],
        "timeLimitSec": 30,
    },
    {
        "id": "quiz_1_5",
        "difficultyLevel": 1,
        "promptText": "x subscript i",
        "targetLatex": "x_i",
        "acceptedVariants": ["x_{i}"],
        "timeLimitSec": 30,
    },
    {
        "id": "quiz_1_6",
        "difficultyLevel": 1,
        "promptText": "x cubed",
        "targetLatex": "x^3",
        "acceptedVariants": ["x^{3}"],
        "timeLimitSec": 30,
    },
    {
        "id": "quiz_1_7",
        "difficultyLevel": 1,
        "promptText": "alpha",
        "targetLatex": "\\alpha",
        "acceptedVariants": [],
        "timeLimitSec": 30,
    },
    {
        "id": "quiz_1_8",
        "difficultyLevel": 1,
        "promptText": "beta",
        "targetLatex": "\\beta",
        "acceptedVariants": [],
        "timeLimitSec": 30,
    },
    {
        "id": "quiz_1_9",
        "difficultyLevel": 1,
        "promptText": "x plus y",
        "targetLatex": "x + y",
        "acceptedVariants": ["x+y"],
        "timeLimitSec": 30,
    },
    {
        "id": "quiz_1_10",
        "difficultyLevel": 1,
        "promptText": "a times b",
        "targetLatex": "a \\times b",
        "acceptedVariants": ["a\\times b"],
        "timeLimitSec": 30,
    },
    # Level 2
    {
        "id": "quiz_2_1",
        "difficultyLevel": 2,
        "promptText": "sum from i equals 1 to n of i",
        "targetLatex": "\\sum_{i=1}^{n} i",
        "acceptedVariants": ["\\sum_{i = 1}^{n} i"],
        "timeLimitSec": 45,
    },
    {
        "id": "quiz_2_2",
        "difficultyLevel": 2,
        "promptText": "integral from 0 to 1 of x squared dx",
        "targetLatex": "\\int_0^1 x^2 dx",
        "acceptedVariants": ["\\int_{0}^{1} x^{2} dx"],
        "timeLimitSec": 45,
    },
    {
        "id": "quiz_2_3",
        "difficultyLevel": 2,
        "promptText": "alpha plus beta",
        "targetLatex": "\\alpha + \\beta",
        "acceptedVariants": ["\\alpha+\\beta"],
        "timeLimitSec": 45,
    },
    {
        "id": "quiz_2_4",
        "difficultyLevel": 2,
        "promptText": "x approaches infinity",
        "targetLatex": "x \\to \\infty",
        "acceptedVariants": ["x\\to\\infty"],
        "timeLimitSec": 45,
    },
    {
        "id": "quiz_2_5",
        "difficultyLevel": 2,
        "promptText": "partial derivative of f with respect to x",
        "targetLatex": "\\frac{\\partial f}{\\partial x}",
        "acceptedVariants": [],
        "timeLimitSec": 45,
    },
    {
        "id": "quiz_2_6",
        "difficultyLevel": 2,
        "promptText": "binomial coefficient n choose k",
        "targetLatex": "\\binom{n}{k}",
        "acceptedVariants": [],
        "timeLimitSec": 45,
    },
    {
        "id": "quiz_2_7",
        "difficultyLevel": 2,
        "promptText": "x less than or equal to y",
        "targetLatex": "x \\le y",
        "acceptedVariants": ["x\\leq y", "x \\leq y"],
        "timeLimitSec": 45,
    },
    {
        "id": "quiz_2_8",
        "difficultyLevel": 2,
        "promptText": "x greater than or equal to y",
        "targetLatex": "x \\ge y",
        "acceptedVariants": ["x\\geq y", "x \\geq y"],
        "timeLimitSec": 45,
    },
    {
        "id": "quiz_2_9",
        "difficultyLevel": 2,
        "promptText": "absolute value of x",
        "targetLatex": "\\left|x\\right|",
        "acceptedVariants": ["|x|", "\\lvert x \\rvert"],
        "timeLimitSec": 45,
    },
    {
        "id": "quiz_2_10",
        "difficultyLevel": 2,
        "promptText": "e to the x",
        "targetLatex": "e^x",
        "acceptedVariants": ["e^{x}"],
        "timeLimitSec": 45,
    },
    # Level 3
    {
        "id": "quiz_3_1",
        "difficultyLevel": 3,
        "promptText": "limit as x approaches 0 of sin x over x",
        "targetLatex": "\\lim_{x \\to 0} \\frac{\\sin x}{x}",
        "acceptedVariants": ["\\lim_{x\\to0}\\frac{\\sin x}{x}"],
        "timeLimitSec": 60,
    },
    {
        "id": "quiz_3_2",
        "difficultyLevel": 3,
        "promptText": "2 by 2 matrix with 1 2 3 4",
        "targetLatex": "\\begin{bmatrix}1 & 2 \\\\ 3 & 4\\end{bmatrix}",
        "acceptedVariants": [],
        "timeLimitSec": 60,
    },
    {
        "id": "quiz_3_3",
        "difficultyLevel": 3,
        "promptText": "quadratic formula",
        "targetLatex": "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
        "acceptedVariants": ["x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}"],
        "timeLimitSec": 60,
    },
    {
        "id": "quiz_3_4",
        "difficultyLevel": 3,
        "promptText": "gradient of f",
        "targetLatex": "\\nabla f",
        "acceptedVariants": [],
        "timeLimitSec": 60,
    },
    {
        "id": "quiz_3_5",
        "difficultyLevel": 3,
        "promptText": "dot product of vectors a and b",
        "targetLatex": "\\vec{a} \\cdot \\vec{b}",
        "acceptedVariants": ["\\mathbf{a} \\cdot \\mathbf{b}"],
        "timeLimitSec": 60,
    },
    {
        "id": "quiz_3_6",
        "difficultyLevel": 3,
        "promptText": "probability of A given B",
        "targetLatex": "P(A \\mid B)",
        "acceptedVariants": ["P(A|B)"],
        "timeLimitSec": 60,
    },
    {
        "id": "quiz_3_7",
        "difficultyLevel": 3,
        "promptText": "expected value of X",
        "targetLatex": "\\mathbb{E}[X]",
        "acceptedVariants": ["E[X]"],
        "timeLimitSec": 60,
    },
    {
        "id": "quiz_3_8",
        "difficultyLevel": 3,
        "promptText": "variance of X",
        "targetLatex": "\\operatorname{Var}(X)",
        "acceptedVariants": ["Var(X)", "\\mathrm{Var}(X)"],
        "timeLimitSec": 60,
    },
    {
        "id": "quiz_3_9",
        "difficultyLevel": 3,
        "promptText": "set of real numbers",
        "targetLatex": "\\mathbb{R}",
        "acceptedVariants": [],
        "timeLimitSec": 60,
    },
    {
        "id": "quiz_3_10",
        "difficultyLevel": 3,
        "promptText": "product from i equals 1 to n of x_i",
        "targetLatex": "\\prod_{i=1}^{n} x_i",
        "acceptedVariants": ["\\prod_{i=1}^{n} x_{i}"],
        "timeLimitSec": 60,
    },
]

def utc_now_iso() -> str:
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")

def get_quiz_sort_key(quiz: dict[str, Any]) -> tuple[int, int | str]:
    quiz_id = quiz["id"]
    suffix = quiz_id.rsplit("_", 1)[-1]

    if suffix.isdigit():
        return quiz["difficultyLevel"], int(suffix)

    return quiz["difficultyLevel"], quiz_id

@dataclass
class MemoryStore:
    users: dict[str, dict[str, str]] = field(default_factory=dict)
    settings_by_user_id: dict[str, dict[str, Any]] = field(default_factory=dict)
    quizzes: dict[str, dict[str, Any]] = field(
        default_factory=lambda: {quiz["id"]: deepcopy(quiz) for quiz in SEED_QUIZZES}
    )
    quiz_sessions: dict[str, dict[str, Any]] = field(default_factory=dict)
    reveal_state_by_session_id: dict[str, set[str]] = field(default_factory=dict)
    user_id_sequence: int = 1
    quiz_id_sequence: int = 1
    session_id_sequence: int = 1

    def create_user(self, email: str, display_name: str, password: str) -> dict[str, str]:
        existing_user = self.get_user_by_email(email)
        if existing_user is not None:
            raise ValueError("Email already exists.")

        user_id = f"user_{self.user_id_sequence}"
        self.user_id_sequence += 1

        user = {
            "id": user_id,
            "email": email,
            "displayName": display_name,
            "password": password,
        }

        self.users[user_id] = user
        self.settings_by_user_id[user_id] = deepcopy(DEFAULT_USER_SETTINGS)

        return deepcopy(user)

    def get_user_by_email(self, email: str) -> dict[str, str] | None:
        normalized_email = email.lower()

        for user in self.users.values():
            if user["email"].lower() == normalized_email:
                return deepcopy(user)

        return None

    def get_user_by_id(self, user_id: str) -> dict[str, str] | None:
        user = self.users.get(user_id)

        if user is None:
            return None

        return deepcopy(user)

    def get_settings_by_user_id(self, user_id: str) -> dict[str, Any]:
        if user_id not in self.settings_by_user_id:
            self.settings_by_user_id[user_id] = deepcopy(DEFAULT_USER_SETTINGS)

        return deepcopy(self.settings_by_user_id[user_id])

    def update_settings_by_user_id(
        self,
        user_id: str,
        patch: dict[str, Any],
    ) -> dict[str, Any]:
        current_settings = self.get_settings_by_user_id(user_id)
        next_settings = {
            **current_settings,
            **{key: value for key, value in patch.items() if value is not None},
        }

        default_level_min = next_settings["defaultLevelMin"]
        default_level_max = next_settings["defaultLevelMax"]

        if default_level_min > default_level_max:
            raise ValueError(
                "defaultLevelMin must be less than or equal to defaultLevelMax."
            )

        self.settings_by_user_id[user_id] = next_settings

        return deepcopy(next_settings)

    def list_quizzes(self, difficulty_level: int | None = None) -> list[dict[str, Any]]:
        quizzes = list(self.quizzes.values())

        if difficulty_level is not None:
            quizzes = [
                quiz
                for quiz in quizzes
                if quiz["difficultyLevel"] == difficulty_level
            ]

        return [
            deepcopy(quiz)
            for quiz in sorted(
                quizzes,
                key=get_quiz_sort_key,
            )
        ]

    def get_quiz_by_id(self, quiz_id: str) -> dict[str, Any] | None:
        quiz = self.quizzes.get(quiz_id)

        if quiz is None:
            return None

        return deepcopy(quiz)

    def create_quiz(self, payload: dict[str, Any]) -> dict[str, Any]:
        difficulty_level = payload["difficultyLevel"]

        while True:
            quiz_id = f"quiz_custom_{self.quiz_id_sequence}"
            self.quiz_id_sequence += 1

            if quiz_id not in self.quizzes:
                break

        quiz = {
            "id": quiz_id,
            "difficultyLevel": difficulty_level,
            "promptText": payload["promptText"],
            "targetLatex": payload["targetLatex"],
            "acceptedVariants": payload.get("acceptedVariants", []),
            "timeLimitSec": payload["timeLimitSec"],
        }

        self.quizzes[quiz_id] = quiz

        return deepcopy(quiz)

    def update_quiz(self, quiz_id: str, patch: dict[str, Any]) -> dict[str, Any] | None:
        current_quiz = self.quizzes.get(quiz_id)

        if current_quiz is None:
            return None

        next_quiz = {
            **current_quiz,
            **{key: value for key, value in patch.items() if value is not None},
        }

        self.quizzes[quiz_id] = next_quiz

        return deepcopy(next_quiz)

    def delete_quiz(self, quiz_id: str) -> bool:
        if quiz_id not in self.quizzes:
            return False

        del self.quizzes[quiz_id]
        return True

    def create_quiz_session(
        self,
        user_id: str,
        level_min: int,
        level_max: int,
    ) -> dict[str, Any]:
        selected_quizzes: list[dict[str, Any]] = []

        for difficulty_level in range(level_min, level_max + 1):
            level_quizzes = self.list_quizzes(difficulty_level=difficulty_level)

            if len(level_quizzes) < 10:
                raise ValueError("Not enough quizzes for selected level range.")

            selected_quizzes.extend(level_quizzes[:10])

        session_id = f"session_{self.session_id_sequence}"
        self.session_id_sequence += 1

        session = {
            "id": session_id,
            "userId": user_id,
            "levelMin": level_min,
            "levelMax": level_max,
            "quizzes": selected_quizzes,
            "currentIndex": 0,
            "answers": [],
            "status": "playing",
            "startedAt": utc_now_iso(),
            "completedAt": None,
        }

        self.quiz_sessions[session_id] = session
        self.reveal_state_by_session_id[session_id] = set()

        return deepcopy(session)

    def get_quiz_session_by_id(self, session_id: str) -> dict[str, Any] | None:
        session = self.quiz_sessions.get(session_id)

        if session is None:
            return None

        return deepcopy(session)

    def get_owned_quiz_session(
        self,
        session_id: str,
        user_id: str,
    ) -> dict[str, Any] | None:
        session = self.quiz_sessions.get(session_id)

        if session is None or session["userId"] != user_id:
            return None

        return deepcopy(session)

    def mark_current_quiz_revealed(
        self,
        session_id: str,
        quiz_id: str,
    ) -> dict[str, Any] | None:
        session = self.quiz_sessions.get(session_id)

        if session is None:
            return None

        current_quiz = self.get_current_quiz(session)

        if current_quiz is None or current_quiz["id"] != quiz_id:
            raise ValueError("quizId does not match current question.")

        self.reveal_state_by_session_id.setdefault(session_id, set()).add(quiz_id)

        return deepcopy(current_quiz)

    def get_current_quiz(self, session: dict[str, Any]) -> dict[str, Any] | None:
        if session["status"] == "completed":
            return None

        current_index = session["currentIndex"]

        if current_index >= len(session["quizzes"]):
            return None

        return deepcopy(session["quizzes"][current_index])

    def has_answer_for_quiz(self, session: dict[str, Any], quiz_id: str) -> bool:
        return any(answer["quizId"] == quiz_id for answer in session["answers"])

    def add_quiz_answer(
        self,
        session_id: str,
        answer: dict[str, Any],
    ) -> dict[str, Any]:
        session = self.quiz_sessions[session_id]

        if self.has_answer_for_quiz(session, answer["quizId"]):
            raise ValueError("Current question has already been submitted.")

        session["answers"].append(answer)

        return deepcopy(answer)

    def was_quiz_revealed(self, session_id: str, quiz_id: str) -> bool:
        return quiz_id in self.reveal_state_by_session_id.get(session_id, set())

    def advance_quiz_session(self, session_id: str) -> dict[str, Any] | None:
        session = self.quiz_sessions.get(session_id)

        if session is None:
            return None

        if session["status"] == "completed":
            return deepcopy(session)

        next_index = session["currentIndex"] + 1

        if next_index >= len(session["quizzes"]):
            session["status"] = "completed"
            session["completedAt"] = utc_now_iso()
            session["currentIndex"] = len(session["quizzes"]) - 1
        else:
            session["currentIndex"] = next_index

        return deepcopy(session)

memory_store = MemoryStore()