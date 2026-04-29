import type { UserSettings, UserSettingsPatch } from "@/entities/settings";
import { apiClient } from "@/shared/api/client";

export function getSettings(token: string) {
  return apiClient<UserSettings>("/settings", {
    method: "GET",
    token,
  });
}

export function patchSettings(token: string, payload: UserSettingsPatch) {
  return apiClient<UserSettings, UserSettingsPatch>("/settings", {
    method: "PATCH",
    token,
    body: payload,
  });
}