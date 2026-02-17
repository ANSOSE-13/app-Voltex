import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
    theme: 'light' | 'dark' | 'system';
    language: string;
    currency: 'USD' | 'EUR';
    exchangeRate: number;
    lastUpdated: number | null;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    setLanguage: (lang: string) => void;
    setCurrency: (currency: 'USD' | 'EUR') => void;
    fetchExchangeRate: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            theme: 'system',
            language: 'en',
            currency: 'USD',
            exchangeRate: 1,
            lastUpdated: null,
            setTheme: (theme) => set({ theme }),
            setLanguage: (lang) => set({ language: lang }),
            setCurrency: async (currency) => {
                set({ currency });
                if (currency === 'USD') {
                    set({ exchangeRate: 1 });
                } else {
                    await get().fetchExchangeRate();
                }
            },
            fetchExchangeRate: async () => {
                const { currency } = get();
                if (currency === 'USD') {
                    set({ exchangeRate: 1, lastUpdated: Date.now() });
                    return;
                }
                try {
                    const response = await fetch('https://open.er-api.com/v6/latest/USD');
                    const data = await response.json();
                    if (data && data.rates && data.rates[currency]) {
                        set({
                            exchangeRate: data.rates[currency],
                            lastUpdated: Date.now()
                        });
                    }
                } catch (error) {
                    console.error('Failed to fetch exchange rate:', error);
                    // Optionally keep old rate or set to default fallback
                }
            }
        }),
        {
            name: 'app-settings',
        }
    )
);
