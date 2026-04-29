import { apiClient } from "@/shared/api/client";
import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  User,
} from "@/entities/auth";

export function signup(payload: SignupRequest) {
  return apiClient<AuthResponse, SignupRequest>("/auth/signup", {
    method: "POST",
    body: payload,
  });
}

export function login(payload: LoginRequest) {
  return apiClient<AuthResponse, LoginRequest>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function getMe(token: string) {
  return apiClient<User>("/auth/me", {
    method: "GET",
    token,
  });
}

export function logout(token: string) {
  return apiClient<{ ok: boolean }>("/auth/logout", {
    method: "POST",
    token,
  });
}