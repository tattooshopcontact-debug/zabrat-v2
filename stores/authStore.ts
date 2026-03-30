import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  display_name: string;
  username: string;
  phone: string;
  avatar_url?: string;
  total_beers: number;
  streak_current: number;
  streak_max: number;
  level: number;
  visibility_mode: 'public' | 'friends' | 'ghost';
}

const MOCK_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  display_name: 'Dev Faouez',
  username: 'faouez_z',
  phone: '+21600000000',
  total_beers: 147,
  streak_current: 5,
  streak_max: 12,
  level: 4,
  visibility_mode: 'friends',
};

interface AuthState {
  devMode: boolean;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setDevMode: (v: boolean) => void;
  setUser: (u: User | null) => void;
  setSession: (s: Session | null) => void;
  isAuthenticated: () => boolean;
  fetchProfile: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  devMode: true, // DEV MODE ON — test sans Twilio
  user: MOCK_USER,
  session: null,
  isLoading: true,

  setDevMode: (v) => set({ devMode: v, user: v ? MOCK_USER : null }),
  setUser: (u) => set({ user: u }),
  setSession: (s) => set({ session: s }),

  isAuthenticated: () => {
    const state = get();
    if (state.devMode) return true;
    return !!state.session;
  },

  fetchProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (data && !error) {
      set({ user: data as User });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },

  initialize: async () => {
    const state = get();
    if (state.devMode) {
      set({ isLoading: false });
      return;
    }

    set({ isLoading: true });
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      set({ session });
      await get().fetchProfile(session.user.id);
    }

    // Écouter les changements d'auth
    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session });
      if (session) {
        await get().fetchProfile(session.user.id);
      } else {
        set({ user: null });
      }
    });

    set({ isLoading: false });
  },
}));
