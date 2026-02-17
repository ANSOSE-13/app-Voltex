import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        Finanzas App
                    </h2>
                </div>
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
