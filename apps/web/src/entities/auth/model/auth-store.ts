"use client";

import { create } from "zustand";

import type { User } from "@/entities/auth/model/types";

const AUTH_TOKEN_STORAGE_KEY = "latex-exerciser-token";
const AUTH_USER_STORAGE_KEY = "latex-exerciser-user";

type AuthPayload = {
  token: string;
  user: User;
};

type AuthState = {
  token: string | null;
  user: User | null;
  isHydrated: boolean;
  setAuth: (payload: AuthPayload) => void;
  hydrate: () => void;
  logout: () => void;
};

function readStoredUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isHydrated: false,

  setAuth: ({ token, user }) => {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));

    set({
      token,
      user,
      isHydrated: true,
    });
  },

  hydrate: () => {
    if (typeof window === "undefined") {
      return;
    }

    const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    const user = readStoredUser();

    set({
      token,
      user,
      isHydrated: true,
    });
  },

  logout: () => {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);

    set({
      token: null,
      user: null,
      isHydrated: true,
    });
  },
}));

export { AUTH_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY };