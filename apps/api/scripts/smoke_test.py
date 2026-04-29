#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import sys
import time
import uuid
from dataclasses import dataclass
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


@dataclass(frozen=True)
class ApiResponse:
    status: int
    body: Any


class SmokeTestError(RuntimeError):
    pass


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run LaTeX Exerciser backend smoke tests.",
    )
    parser.add_argument(
        "--base-url",
        default="http://localhost:8000/api",
        help="Backend API base URL. Default: http://localhost:8000/api",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=5.0,
        help="HTTP request timeout in seconds. Default: 5.0",
    )
    return parser.parse_args()


def print_step(message: str) -> None:
    print(f"▶ {message}")


def print_pass(message: str) -> None:
    print(f"✓ {message}")


def fail(message: str) -> None:
    raise SmokeTestError(message)


def encode_json(payload: Any | None) -> bytes | None:
    if payload is None:
        return None

    return json.dumps(payload).encode("utf-8")


def decode_json(raw: bytes) -> Any:
    if not raw:
        return None

    try:
      return json.loads(raw.decode("utf-8"))
    except json.JSONDecodeError as error:
        raise SmokeTestError(f"Response is not valid JSON: {raw!r}") from error


def request_json(
    *,
    base_url: str,
    path: str,
    method: str = "GET",
    token: str | None = None,
    payload: Any | None = None,
    timeout: float = 5.0,
    expected_status: int = 200,
) -> ApiResponse:
    url = f"{base_url}{path}"
    headers = {
        "Accept": "application/json",
    }

    body = encode_json(payload)

    if body is not None:
        headers["Content-Type"] = "application/json"

    if token is not None:
        headers["Authorization"] = f"Bearer {token}"

    request = Request(
        url=url,
        data=body,
        headers=headers,
        method=method,
    )

    try:
        with urlopen(request, timeout=timeout) as response:
            response_body = decode_json(response.read())
            status = response.status
    except HTTPError as error:
        response_body = decode_json(error.read())
        status = error.code
    except URLError as error:
        raise SmokeTestError(
            f"Failed to connect to backend at {base_url}. "
            "Is uvicorn running?"
        ) from error

    if status != expected_status:
        raise SmokeTestError(
            f"{method} {path} expected {expected_status}, got {status}. "
            f"Body: {response_body}"
        )

    return ApiResponse(status=status, body=response_body)


def assert_dict(value: Any, context: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        fail(f"{context}: expected object, got {type(value).__name__}")

    return value


def assert_list(value: Any, context: str) -> list[Any]:
    if not isinstance(value, list):
        fail(f"{context}: expected list, got {type(value).__name__}")

    return value


def assert_key(payload: dict[str, Any], key: str, context: str) -> Any:
    if key not in payload:
        fail(f"{context}: missing key {key!r}. Payload: {payload}")

    return payload[key]


def run_smoke_test(base_url: str, timeout: float) -> None:
    run_id = uuid.uuid4().hex[:10]
    email = f"smoke-{run_id}@example.com"
    password = "password123"
    display_name = "Smoke Test"

    print_step(f"Using backend: {base_url}")

    health = request_json(
        base_url=base_url,
        path="/health",
        timeout=timeout,
    )
    health_body = assert_dict(health.body, "health")
    if health_body.get("status") != "ok":
        fail(f"health: expected status=ok, got {health_body}")
    print_pass("health check")

    signup = request_json(
        base_url=base_url,
        path="/auth/signup",
        method="POST",
        payload={
            "email": email,
            "displayName": display_name,
            "password": password,
        },
        timeout=timeout,
    )
    signup_body = assert_dict(signup.body, "signup")
    token = assert_key(signup_body, "token", "signup")
    user = assert_dict(assert_key(signup_body, "user", "signup"), "signup.user")

    if not isinstance(token, str) or not token:
        fail(f"signup: invalid token {token!r}")

    if user.get("email") != email:
        fail(f"signup: expected email {email}, got {user.get('email')}")
    print_pass("auth signup")

    login = request_json(
        base_url=base_url,
        path="/auth/login",
        method="POST",
        payload={
            "email": email,
            "password": password,
        },
        timeout=timeout,
    )
    login_body = assert_dict(login.body, "login")
    login_token = assert_key(login_body, "token", "login")

    if login_token != token:
        fail("login: expected token to match signup token")
    print_pass("auth login")

    me = request_json(
        base_url=base_url,
        path="/auth/me",
        token=token,
        timeout=timeout,
    )
    me_body = assert_dict(me.body, "me")
    if me_body.get("email") != email:
        fail(f"me: expected email {email}, got {me_body.get('email')}")
    print_pass("auth me")

    settings = request_json(
        base_url=base_url,
        path="/settings",
        token=token,
        timeout=timeout,
    )
    settings_body = assert_dict(settings.body, "settings")
    for key in [
        "defaultLevelMin",
        "defaultLevelMax",
        "defaultTimeLimit",
        "strictMode",
        "autoAdvanceAfterAnswer",
    ]:
        assert_key(settings_body, key, "settings")
    print_pass("settings get")

    patched_settings = request_json(
        base_url=base_url,
        path="/settings",
        method="PATCH",
        token=token,
        payload={
            "defaultLevelMin": 1,
            "defaultLevelMax": 1,
            "defaultTimeLimit": 15,
            "strictMode": False,
            "autoAdvanceAfterAnswer": False,
        },
        timeout=timeout,
    )
    patched_settings_body = assert_dict(patched_settings.body, "settings patch")

    if patched_settings_body.get("defaultTimeLimit") != 15:
        fail(
            "settings patch: expected defaultTimeLimit=15, "
            f"got {patched_settings_body.get('defaultTimeLimit')}"
        )
    print_pass("settings patch")

    quizzes = request_json(
        base_url=base_url,
        path="/quizzes?difficultyLevel=1",
        timeout=timeout,
    )
    quizzes_body = assert_list(quizzes.body, "quizzes")

    if len(quizzes_body) < 10:
        fail(f"quizzes: expected at least 10 level-1 quizzes, got {len(quizzes_body)}")
    print_pass("quiz list")

    session_create = request_json(
        base_url=base_url,
        path="/quiz/sessions",
        method="POST",
        token=token,
        payload={
            "levelMin": 1,
            "levelMax": 1,
        },
        timeout=timeout,
    )
    session_create_body = assert_dict(session_create.body, "session create")
    session_id = assert_key(session_create_body, "sessionId", "session create")

    if not isinstance(session_id, str) or not session_id:
        fail(f"session create: invalid sessionId {session_id!r}")
    print_pass("quiz session create")

    session = request_json(
        base_url=base_url,
        path=f"/quiz/sessions/{session_id}",
        token=token,
        timeout=timeout,
    )
    session_body = assert_dict(session.body, "session get")
    session_quizzes = assert_list(assert_key(session_body, "quizzes", "session get"), "session.quizzes")
    current_index = assert_key(session_body, "currentIndex", "session get")
    current_question_started_at = assert_key(
        session_body,
        "currentQuestionStartedAt",
        "session get",
    )

    if current_index != 0:
        fail(f"session get: expected currentIndex=0, got {current_index}")

    if not isinstance(current_question_started_at, str) or not current_question_started_at:
        fail("session get: currentQuestionStartedAt must be a non-empty string")

    first_quiz = assert_dict(session_quizzes[0], "session.quizzes[0]")

    if first_quiz.get("timeLimitSec") != 15:
        fail(
            "session get: expected settings override timeLimitSec=15, "
            f"got {first_quiz.get('timeLimitSec')}"
        )
    print_pass("quiz session get")

    submit = request_json(
        base_url=base_url,
        path=f"/quiz/sessions/{session_id}/submit",
        method="POST",
        token=token,
        payload={
            "quizId": first_quiz["id"],
            "submittedLatex": first_quiz["targetLatex"],
            "responseTimeSec": 1,
            "timedOut": False,
        },
        timeout=timeout,
    )
    submit_body = assert_dict(submit.body, "submit")

    if submit_body.get("isCorrect") is not True:
        fail(f"submit: expected isCorrect=true, got {submit_body}")
    print_pass("quiz submit correct answer")

    duplicate_submit = request_json(
        base_url=base_url,
        path=f"/quiz/sessions/{session_id}/submit",
        method="POST",
        token=token,
        payload={
            "quizId": first_quiz["id"],
            "submittedLatex": first_quiz["targetLatex"],
            "responseTimeSec": 1,
            "timedOut": False,
        },
        timeout=timeout,
        expected_status=409,
    )
    duplicate_body = assert_dict(duplicate_submit.body, "duplicate submit")

    if "already been submitted" not in str(duplicate_body.get("detail", "")):
        fail(f"duplicate submit: unexpected body {duplicate_body}")
    print_pass("duplicate submit returns 409")

    next_response = request_json(
        base_url=base_url,
        path=f"/quiz/sessions/{session_id}/next",
        method="POST",
        token=token,
        payload={},
        timeout=timeout,
    )
    next_body = assert_dict(next_response.body, "next")

    if next_body.get("currentIndex") != 1:
        fail(f"next: expected currentIndex=1, got {next_body}")
    print_pass("quiz next question")

    session_after_next = request_json(
        base_url=base_url,
        path=f"/quiz/sessions/{session_id}",
        token=token,
        timeout=timeout,
    )
    session_after_next_body = assert_dict(session_after_next.body, "session after next")
    second_quiz = assert_dict(
        assert_list(
            assert_key(session_after_next_body, "quizzes", "session after next"),
            "session after next quizzes",
        )[1],
        "second quiz",
    )

    reveal = request_json(
        base_url=base_url,
        path=f"/quiz/sessions/{session_id}/reveal",
        method="POST",
        token=token,
        payload={
            "quizId": second_quiz["id"],
        },
        timeout=timeout,
    )
    reveal_body = assert_dict(reveal.body, "reveal")

    if reveal_body.get("correctLatex") != second_quiz["targetLatex"]:
        fail(f"reveal: unexpected correctLatex {reveal_body}")
    print_pass("quiz reveal answer")

    result = request_json(
        base_url=base_url,
        path=f"/quiz/sessions/{session_id}/result",
        token=token,
        timeout=timeout,
    )
    result_body = assert_dict(result.body, "result")

    for key in [
        "sessionId",
        "totalScore",
        "accuracy",
        "averageResponseTime",
        "correctCount",
        "wrongCount",
        "timeoutCount",
        "answerRevealCount",
        "bestDifficultyCleared",
    ]:
        assert_key(result_body, key, "result")

    if result_body["sessionId"] != session_id:
        fail(f"result: expected sessionId={session_id}, got {result_body}")
    print_pass("quiz result")

    print()
    print("Backend smoke test passed.")


def main() -> int:
    args = parse_args()

    try:
        run_smoke_test(
            base_url=args.base_url.rstrip("/"),
            timeout=args.timeout,
        )
    except SmokeTestError as error:
        print(f"✗ {error}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("Interrupted.", file=sys.stderr)
        return 130

    return 0


if __name__ == "__main__":
    raise SystemExit(main())