import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
    isPrivacyMode: boolean;
    togglePrivacyMode: () => void;
    setPrivacyMode: (value: boolean) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            isPrivacyMode: false,
            togglePrivacyMode: () => set((state) => ({ isPrivacyMode: !state.isPrivacyMode })),
            setPrivacyMode: (value) => set({ isPrivacyMode: value }),
        }),
        {
            name: 'ui-storage',
        }
    )
);
