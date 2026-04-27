from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import get_current_user
from app.repositories import memory_store
from app.schemas import UserSettingsPatch, UserSettingsResponse

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("", response_model=UserSettingsResponse)
def get_settings(
    current_user: Annotated[dict[str, str], Depends(get_current_user)],
) -> UserSettingsResponse:
    settings = memory_store.get_settings_by_user_id(current_user["id"])

    return UserSettingsResponse(**settings)


@router.patch("", response_model=UserSettingsResponse)
def patch_settings(
    payload: UserSettingsPatch,
    current_user: Annotated[dict[str, str], Depends(get_current_user)],
) -> UserSettingsResponse:
    try:
        settings = memory_store.update_settings_by_user_id(
            user_id=current_user["id"],
            patch=payload.model_dump(),
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    return UserSettingsResponse(**settings)