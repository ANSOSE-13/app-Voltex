import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth } from '../services/firebase';
import {
    LayoutDashboard,
    FolderOpen,
    Settings,
    LogOut,
    Menu,
    X,
    Eye,
    EyeOff
} from 'lucide-react';
import clsx from 'clsx';
import { useUIStore } from '../stores/useUIStore';


const PrivacyToggle = () => {
    const { isPrivacyMode, togglePrivacyMode } = useUIStore();
    return (
        <button
            onClick={togglePrivacyMode}
            className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title={isPrivacyMode ? "Show sensitive data" : "Hide sensitive data"}
        >
            {isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
    );
};

const MainLayout: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error signing out', error);
        }
    };

    const navItems = [
        { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
        { path: '/files', label: t('files'), icon: FolderOpen },
        { path: '/settings', label: t('settings'), icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="p-6 flex items-center justify-center border-b border-gray-100 dark:border-gray-700">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Velox
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                                location.pathname === item.path
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium shadow-sm"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200"
                            )}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>Privacy Mode</span>
                        <PrivacyToggle />
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span>{t('logout')}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden flex flex-col relative">
                {/* Mobile Header */}
                <header className="md:hidden bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-20 shadow-sm">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Velox
                    </h1>
                    <div className="flex items-center gap-2">
                        <PrivacyToggle />
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </header>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="absolute inset-0 z-10 bg-white dark:bg-gray-900 p-4 pt-20 flex flex-col space-y-4 md:hidden animate-in slide-in-from-top-10 fade-in duration-200">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={clsx(
                                    "flex items-center space-x-4 px-4 py-3 rounded-xl",
                                    location.pathname === item.path
                                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                                        : "text-gray-600 dark:text-gray-400"
                                )}
                            >
                                <item.icon size={24} />
                                <span className="text-lg">{item.label}</span>
                            </Link>
                        ))}

                        <div className="h-px bg-gray-200 dark:bg-gray-700 my-4" />

                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-4 px-4 py-3 text-red-500 w-full"
                        >
                            <LogOut size={24} />
                            <span className="text-lg">{t('logout')}</span>
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
                    <Outlet />
                </div>

                {/* Bottom Navigation (Visible only on mobile when menu is closed) */}
                {!isMobileMenuOpen && (
                    <nav className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around p-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex flex-col items-center p-2 rounded-lg transition-colors",
                                    location.pathname === item.path
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-gray-500 dark:text-gray-400"
                                )}
                            >
                                <item.icon size={24} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
                                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                )}
            </main>
        </div>
    );
};

export default MainLayout;
