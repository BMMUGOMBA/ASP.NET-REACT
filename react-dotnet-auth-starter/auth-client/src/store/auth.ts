import { create } from "zustand";

type User = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  roles: string[];
};

type AuthState = {
  user: User | null;
  accessToken: string | null;
  expiresAt: string | null;
  setAuth: (u: User, token: string, exp: string) => void;
  clear: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  expiresAt: null,
  setAuth: (u, token, exp) => set({ user: u, accessToken: token, expiresAt: exp }),
  clear: () => set({ user: null, accessToken: null, expiresAt: null })
}));
