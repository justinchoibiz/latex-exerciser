from copy import deepcopy
from dataclasses import dataclass, field
from typing import Any


DEFAULT_USER_SETTINGS: dict[str, Any] = {
    "defaultLevelMin": 1,
    "defaultLevelMax": 3,
    "defaultTimeLimit": 60,
    "strictMode": False,
    "autoAdvanceAfterAnswer": False,
}


@dataclass
class MemoryStore:
    users: dict[str, dict[str, str]] = field(default_factory=dict)
    settings_by_user_id: dict[str, dict[str, Any]] = field(default_factory=dict)
    user_id_sequence: int = 1

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

        return user

    def get_user_by_email(self, email: str) -> dict[str, str] | None:
        normalized_email = email.lower()

        for user in self.users.values():
            if user["email"].lower() == normalized_email:
                return user

        return None

    def get_user_by_id(self, user_id: str) -> dict[str, str] | None:
        return self.users.get(user_id)

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


memory_store = MemoryStore()