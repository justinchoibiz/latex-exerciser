from pydantic import BaseModel, Field, model_validator


class UserSettingsResponse(BaseModel):
    defaultLevelMin: int = Field(ge=1, le=10)
    defaultLevelMax: int = Field(ge=1, le=10)
    defaultTimeLimit: int = Field(ge=5, le=300)
    strictMode: bool
    autoAdvanceAfterAnswer: bool

    @model_validator(mode="after")
    def validate_level_range(self) -> "UserSettingsResponse":
        if self.defaultLevelMin > self.defaultLevelMax:
            raise ValueError(
                "defaultLevelMin must be less than or equal to defaultLevelMax."
            )
        return self


class UserSettingsPatch(BaseModel):
    defaultLevelMin: int | None = Field(default=None, ge=1, le=10)
    defaultLevelMax: int | None = Field(default=None, ge=1, le=10)
    defaultTimeLimit: int | None = Field(default=None, ge=5, le=300)
    strictMode: bool | None = None
    autoAdvanceAfterAnswer: bool | None = None

    @model_validator(mode="after")
    def validate_patch(self) -> "UserSettingsPatch":
        has_at_least_one_field = any(
            value is not None for value in self.model_dump().values()
        )

        if not has_at_least_one_field:
            raise ValueError("At least one settings field must be provided.")

        if (
            self.defaultLevelMin is not None
            and self.defaultLevelMax is not None
            and self.defaultLevelMin > self.defaultLevelMax
        ):
            raise ValueError(
                "defaultLevelMin must be less than or equal to defaultLevelMax."
            )

        return self