from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.auth import get_current_user
from app.repositories import memory_store
from app.schemas import (
    CreateQuizRequest,
    OkResponse,
    PatchQuizRequest,
    QuizResponse,
)

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])


@router.get("", response_model=list[QuizResponse])
def list_quizzes(
    difficultyLevel: Annotated[int | None, Query(ge=1, le=10)] = None,
) -> list[QuizResponse]:
    quizzes = memory_store.list_quizzes(difficulty_level=difficultyLevel)

    return [QuizResponse(**quiz) for quiz in quizzes]


@router.post("", response_model=QuizResponse)
def create_quiz(
    payload: CreateQuizRequest,
    _current_user: Annotated[dict[str, str], Depends(get_current_user)],
) -> QuizResponse:
    quiz = memory_store.create_quiz(payload.model_dump())

    return QuizResponse(**quiz)


@router.patch("/{quiz_id}", response_model=QuizResponse)
def patch_quiz(
    quiz_id: str,
    payload: PatchQuizRequest,
    _current_user: Annotated[dict[str, str], Depends(get_current_user)],
) -> QuizResponse:
    quiz = memory_store.update_quiz(
        quiz_id=quiz_id,
        patch=payload.model_dump(),
    )

    if quiz is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found.",
        )

    return QuizResponse(**quiz)


@router.delete("/{quiz_id}", response_model=OkResponse)
def delete_quiz(
    quiz_id: str,
    _current_user: Annotated[dict[str, str], Depends(get_current_user)],
) -> OkResponse:
    deleted = memory_store.delete_quiz(quiz_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found.",
        )

    return OkResponse(ok=True)