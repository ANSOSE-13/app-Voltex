import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../services/firebase';

const Login: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            navigate('/dashboard');
        } catch (err: any) {
            setError('Failed to login with Google.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError('Failed to login. Please check your credentials.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white text-center">{t('login')}</h3>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <div className="rounded-md shadow-sm -space-y-px">
                <div>
                    <label htmlFor="email-address" className="sr-only">{t('email')}</label>
                    <input
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder={t('email')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="password" className="sr-only">{t('password')}</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder={t('password')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                >
                    {loading ? 'Logging in...' : t('login')}
                </button>

                <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-500 text-xs uppercase">OR</span>
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26-1.19-.58z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Sign in with Google
                </button>
            </div>

            <div className="text-sm text-center">
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                    Original user? {t('register')}
                </Link>
            </div>
        </form>
    );
}

export default Login;
