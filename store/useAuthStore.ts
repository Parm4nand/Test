import { create } from "zustand";
import { Profile } from "@/types";
import type { Session } from "@supabase/supabase-js";

interface AuthState {
  user: Profile | null;
  session: Session | null;
  isLoading: boolean;
  setUser: (user: Profile | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
}));
