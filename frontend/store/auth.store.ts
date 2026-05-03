"use client";

import { create } from "zustand";
import { getSession, logout } from "@/services/auth.api";
import { AuthResponse, Role, UserProfile } from "@/types/user";

type AuthState = {
  user: UserProfile | null;
  role: Role | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  setSession: (response: AuthResponse) => void;
  clearSession: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  hydrated: false,
  setSession: (response) => {
    set({
      user: response.user,
      role: response.user.role,
      isAuthenticated: true,
      hydrated: true,
    });
  },
  clearSession: async () => {
    await logout();
    set({
      user: null,
      role: null,
      isAuthenticated: false,
      hydrated: true,
    });
  },
  hydrate: async () => {
    const session = await getSession();
    if (!session.authenticated || !session.user) {
      set({
        user: null,
        role: null,
        isAuthenticated: false,
        hydrated: true,
      });
      return;
    }

    set({
      user: session.user,
      role: session.user.role,
      isAuthenticated: true,
      hydrated: true,
    });
  },
}));
