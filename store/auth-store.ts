import { create } from "zustand";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isInitializing: boolean;
  setSession: (user: AuthUser, accessToken: string) => void;
  clearSession: () => void;
  setInitializing: (v: boolean) => void;
}

// accessToken deliberately lives only in memory (this store) — never in
// localStorage — so an XSS payload can't read it off disk. It's restored on
// page load via a silent call to /api/auth/refresh using the httpOnly cookie.
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isInitializing: true,
  setSession: (user, accessToken) => set({ user, accessToken, isInitializing: false }),
  clearSession: () => set({ user: null, accessToken: null, isInitializing: false }),
  setInitializing: (v) => set({ isInitializing: v }),
}));
