import React from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Monitor, Languages, LogOut } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { useAuthStore } from '../stores/useAuthStore';
import clsx from 'clsx';
import UserProfile from '../components/UserProfile';

const Settings: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { theme, setTheme, language, setLanguage, currency, setCurrency } = useAppStore();
    const { signOut } = useAuthStore();

    const handleLanguageChange = (lang: string) => {
        setLanguage(lang);
        i18n.changeLanguage(lang);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-20 md:pb-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('settings')}</h2>

            {/* User Profile Section */}
            <UserProfile />

            {/* Appearance Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Monitor size={20} />
                    {t('theme')}
                </h3>

                <div className="grid grid-cols-3 gap-4">
                    <button
                        onClick={() => setTheme('light')}
                        className={clsx(
                            "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                            theme === 'light'
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                : "border-transparent bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        )}
                    >
                        <Sun size={24} className="mb-2" />
                        <span className="text-sm font-medium">Light</span>
                    </button>

                    <button
                        onClick={() => setTheme('dark')}
                        className={clsx(
                            "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                            theme === 'dark'
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                : "border-transparent bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        )}
                    >
                        <Moon size={24} className="mb-2" />
                        <span className="text-sm font-medium">Dark</span>
                    </button>

                    <button
                        onClick={() => setTheme('system')}
                        className={clsx(
                            "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                            theme === 'system'
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                : "border-transparent bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        )}
                    >
                        <Monitor size={24} className="mb-2" />
                        <span className="text-sm font-medium">System</span>
                    </button>
                </div>
            </div>

            {/* Language Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Languages size={20} />
                    {t('language')}
                </h3>

                <div className="space-y-2">
                    <button
                        onClick={() => handleLanguageChange('en')}
                        className={clsx(
                            "w-full flex items-center justify-between p-4 rounded-xl transition-all",
                            language === 'en'
                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                                : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                        )}
                    >
                        <span>English</span>
                        {language === 'en' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                    </button>

                    <button
                        onClick={() => handleLanguageChange('es')}
                        className={clsx(
                            "w-full flex items-center justify-between p-4 rounded-xl transition-all",
                            language === 'es'
                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                                : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                        )}
                    >
                        <span>Español</span>
                        {language === 'es' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                    </button>
                </div>
            </div>

            {/* Currency Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="text-xl">💱</span>
                    {t('currency', 'Currency')}
                </h3>

                <div className="space-y-2">
                    <button
                        onClick={() => setCurrency('USD')}
                        className={clsx(
                            "w-full flex items-center justify-between p-4 rounded-xl transition-all",
                            currency === 'USD'
                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                                : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                        )}
                    >
                        <span>USD ($)</span>
                        {currency === 'USD' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                    </button>

                    <button
                        onClick={() => setCurrency('EUR')}
                        className={clsx(
                            "w-full flex items-center justify-between p-4 rounded-xl transition-all",
                            currency === 'EUR'
                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                                : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                        )}
                    >
                        <span>EUR (€)</span>
                        {currency === 'EUR' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                    </button>

                    {currency !== 'USD' && (
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-sm space-y-2">
                            <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                <span>Exchange Rate:</span>
                                <span className="font-mono font-medium">1 USD = {useAppStore.getState().exchangeRate.toFixed(4)} {currency}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-500 dark:text-gray-500 text-xs">
                                <span>Last updated: {useAppStore.getState().lastUpdated ? new Date(useAppStore.getState().lastUpdated!).toLocaleTimeString() : 'Never'}</span>
                                <button
                                    onClick={() => useAppStore.getState().fetchExchangeRate()}
                                    className="text-blue-500 hover:text-blue-600 underline"
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    🛠️ Developer Tools
                </h3>
                <button
                    onClick={async () => {
                        const { user } = useAuthStore.getState();
                        if (user && window.confirm('Generate demo data for this account? This will add sample transactions, wishlist items, and savings.')) {
                            const { seedUserData } = await import('../utils/seedData');
                            await seedUserData(user.uid);
                            alert('Data seeded! Refresh the dashboard to see changes.');
                        }
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-xl transition-colors font-medium"
                >
                    <span className="text-xl">🎲</span> Generate Demo Data
                </button>
            </div>

            {/* Logout Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <button
                    onClick={signOut}
                    className="w-full flex items-center justify-center gap-2 p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium"
                >
                    <LogOut size={20} />
                    {t('logout')}
                </button>
            </div>
        </div>
    );
};

export default Settings;
