from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import create_mock_token, get_current_user
from app.repositories import memory_store
from app.schemas import (
    AuthResponse,
    LoginRequest,
    LogoutResponse,
    SignupRequest,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


def to_user_response(user: dict[str, str]) -> UserResponse:
    return UserResponse(
        id=user["id"],
        email=user["email"],
        displayName=user["displayName"],
    )


@router.post("/signup", response_model=AuthResponse)
def signup(payload: SignupRequest) -> AuthResponse:
    try:
        user = memory_store.create_user(
            email=str(payload.email),
            display_name=payload.displayName,
            password=payload.password,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error

    return AuthResponse(
        token=create_mock_token(user["id"]),
        user=to_user_response(user),
    )


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest) -> AuthResponse:
    user = memory_store.get_user_by_email(str(payload.email))

    if user is None or user["password"] != payload.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    return AuthResponse(
        token=create_mock_token(user["id"]),
        user=to_user_response(user),
    )


@router.post("/logout", response_model=LogoutResponse)
def logout(
    _current_user: Annotated[dict[str, str], Depends(get_current_user)],
) -> LogoutResponse:
    return LogoutResponse(ok=True)


@router.get("/me", response_model=UserResponse)
def me(
    current_user: Annotated[dict[str, str], Depends(get_current_user)],
) -> UserResponse:
    return to_user_response(current_user)