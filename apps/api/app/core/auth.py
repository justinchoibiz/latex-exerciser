from typing import Annotated

from fastapi import Depends, Header, HTTPException, status

from app.repositories import memory_store


TOKEN_PREFIX = "mock-token-"


def create_mock_token(user_id: str) -> str:
    return f"{TOKEN_PREFIX}{user_id}"


def parse_mock_token(token: str) -> str:
    if not token.startswith(TOKEN_PREFIX):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token.",
        )

    user_id = token.removeprefix(TOKEN_PREFIX)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token.",
        )

    return user_id


def extract_bearer_token(authorization: str | None) -> str:
    if authorization is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header.",
        )

    scheme, separator, token = authorization.partition(" ")

    if separator == "" or scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header.",
        )

    return token


def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
) -> dict[str, str]:
    token = extract_bearer_token(authorization)
    user_id = parse_mock_token(token)
    user = memory_store.get_user_by_id(user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token.",
        )

    return user