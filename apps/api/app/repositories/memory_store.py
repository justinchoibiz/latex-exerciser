from dataclasses import dataclass, field


@dataclass
class MemoryStore:
    users: dict[str, dict[str, str]] = field(default_factory=dict)
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

        return user

    def get_user_by_email(self, email: str) -> dict[str, str] | None:
        normalized_email = email.lower()

        for user in self.users.values():
            if user["email"].lower() == normalized_email:
                return user

        return None

    def get_user_by_id(self, user_id: str) -> dict[str, str] | None:
        return self.users.get(user_id)


memory_store = MemoryStore()