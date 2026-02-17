import { create } from 'zustand';
import type { User } from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthState {
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
    signOut: async () => {
        await auth.signOut();
        set({ user: null });
    }
}));
