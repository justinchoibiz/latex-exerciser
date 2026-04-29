from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import get_current_user
from app.repositories import memory_store
from app.schemas import (
    CreateQuizSessionRequest,
    CreateQuizSessionResponse,
    NextQuestionResponse,
    QuizResultResponse,
    QuizSessionResponse,
    RevealAnswerRequest,
    RevealAnswerResponse,
    SubmitAnswerRequest,
    SubmitAnswerResponse,
)
from app.services import calculate_question_score, grade_latex_answer

router = APIRouter(prefix="/quiz/sessions", tags=["Quiz Sessions"])


def get_owned_session_or_404(session_id: str, user_id: str) -> dict:
    session = memory_store.get_owned_quiz_session(
        session_id=session_id,
        user_id=user_id,
    )

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz session not found.",
        )

    return session


@router.post("", response_model=CreateQuizSessionResponse)
def create_quiz_session(
    payload: CreateQuizSessionRequest,
    current_user: Annotated[dict[str, str], Depends(get_current_user)],
) -> CreateQuizSessionResponse:
    settings = memory_store.get_settings_by_user_id(current_user["id"])

    try:
        session = memory_store.create_quiz_session(
            user_id=current_user["id"],
            level_min=payload.levelMin,
            level_max=payload.levelMax,
            time_limit_sec_override=settings["defaultTimeLimit"],
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    return CreateQuizSessionResponse(sessionId=session["id"])


@router.get("/{session_id}", response_model=QuizSessionResponse)
def get_quiz_session(
    session_id: str,
    current_user: Annotated[dict[str, str], Depends(get_current_user)],
) -> QuizSessionResponse:
    session = get_owned_session_or_404(
        session_id=session_id,
        user_id=current_user["id"],
    )

    return QuizSessionResponse(**session)


@router.post("/{session_id}/submit", response_model=SubmitAnswerResponse)
def submit_answer(
    session_id: str,
    payload: SubmitAnswerRequest,
    current_user: Annotated[dict[str, str], Depends(get_current_user)],
) -> SubmitAnswerResponse:
    session = get_owned_session_or_404(
        session_id=session_id,
        user_id=current_user["id"],
    )

    if session["status"] == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quiz session is already completed.",
        )

    current_quiz = memory_store.get_current_quiz(session)

    if current_quiz is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No current quiz.",
        )

    if current_quiz["id"] != payload.quizId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="quizId does not match current question.",
        )

    if payload.timedOut:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot submit after timeout.",
        )

    settings = memory_store.get_settings_by_user_id(current_user["id"])
    used_reveal = memory_store.was_quiz_revealed(
        session_id=session_id,
        quiz_id=payload.quizId,
    )

    is_correct = grade_latex_answer(
        submitted_latex=payload.submittedLatex,
        target_latex=current_quiz["targetLatex"],
        accepted_variants=current_quiz["acceptedVariants"],
        strict_mode=settings["strictMode"],
    )

    score = calculate_question_score(
        is_correct=is_correct,
        difficulty_level=current_quiz["difficultyLevel"],
        response_time_sec=payload.responseTimeSec,
        time_limit_sec=current_quiz["timeLimitSec"],
        used_reveal=used_reveal,
    )

    answer = {
        "quizId": payload.quizId,
        "submittedLatex": payload.submittedLatex,
        "isCorrect": is_correct,
        "usedReveal": used_reveal,
        "timedOut": payload.timedOut,
        "responseTimeSec": payload.responseTimeSec,
        "score": score,
    }

    try:
        memory_store.add_quiz_answer(
            session_id=session_id,
            answer=answer,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error

    return SubmitAnswerResponse(
        isCorrect=is_correct,
        score=score,
        correctLatex=current_quiz["targetLatex"],
        acceptedVariants=current_quiz["acceptedVariants"],
    )


@router.post("/{session_id}/reveal", response_model=RevealAnswerResponse)
def reveal_answer(
    session_id: str,
    payload: RevealAnswerRequest,
    current_user: Annotated[dict[str, str], Depends(get_current_user)],
) -> RevealAnswerResponse:
    session = get_owned_session_or_404(
        session_id=session_id,
        user_id=current_user["id"],
    )

    if session["status"] == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quiz session is already completed.",
        )

    try:
        current_quiz = memory_store.mark_current_quiz_revealed(
            session_id=session_id,
            quiz_id=payload.quizId,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    if current_quiz is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz session not found.",
        )

    return RevealAnswerResponse(
        correctLatex=current_quiz["targetLatex"],
        acceptedVariants=current_quiz["acceptedVariants"],
    )


@router.post("/{session_id}/next", response_model=NextQuestionResponse)
def next_question(
    session_id: str,
    current_user: Annotated[dict[str, str], Depends(get_current_user)],
) -> NextQuestionResponse:
    _session = get_owned_session_or_404(
        session_id=session_id,
        user_id=current_user["id"],
    )

    next_session = memory_store.advance_quiz_session(session_id=session_id)

    if next_session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz session not found.",
        )

    return NextQuestionResponse(
        sessionId=next_session["id"],
        currentIndex=next_session["currentIndex"],
        status=next_session["status"],
    )


@router.get("/{session_id}/result", response_model=QuizResultResponse)
def get_quiz_result(
    session_id: str,
    current_user: Annotated[dict[str, str], Depends(get_current_user)],
) -> QuizResultResponse:
    session = get_owned_session_or_404(
        session_id=session_id,
        user_id=current_user["id"],
    )

    answers = session["answers"]
    total_questions = len(session["quizzes"])

    correct_answers = [answer for answer in answers if answer["isCorrect"]]
    wrong_answers = [answer for answer in answers if not answer["isCorrect"]]
    timeout_answers = [answer for answer in answers if answer["timedOut"]]
    reveal_answers = [answer for answer in answers if answer["usedReveal"]]

    total_score = round(
        sum(answer["score"] for answer in answers),
        2,
    )

    accuracy = round(
        len(correct_answers) / total_questions if total_questions > 0 else 0,
        4,
    )

    average_response_time = round(
        sum(answer["responseTimeSec"] for answer in answers) / len(answers)
        if answers
        else 0,
        2,
    )

    correct_quiz_ids = {answer["quizId"] for answer in correct_answers}
    best_difficulty_cleared = 0

    for quiz in session["quizzes"]:
        if quiz["id"] in correct_quiz_ids:
            best_difficulty_cleared = max(
                best_difficulty_cleared,
                quiz["difficultyLevel"],
            )

    return QuizResultResponse(
        sessionId=session["id"],
        totalScore=total_score,
        accuracy=accuracy,
        averageResponseTime=average_response_time,
        correctCount=len(correct_answers),
        wrongCount=len(wrong_answers),
        timeoutCount=len(timeout_answers),
        answerRevealCount=len(reveal_answers),
        bestDifficultyCleared=best_difficulty_cleared,
    )